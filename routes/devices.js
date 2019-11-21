let express = require('express');
let router = express.Router();
let Devices = require("../models/devices");
var Users = require("../models/users");
let Activities = require("../models/activities"); 
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
var secret = "supersecret";
var bcrypt = require("bcrypt-nodejs"); 
let jwt = require("jwt-simple");
const request = require('request'); 
global.tempGlobal; 
global.humidityGlobal; 

function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}


router.get('/uvThreshold',function(req, res){
	var query = {id:req.query.id};
	Devices.findOne(query, function(err, device){
		if(err){
			res.status(200).json({success:false, message:"Could not locate device with that id."});
		}
		var userQuery = {email:device.email}; 
		Users.findOne(userQuery, function(err, user){
			if(err){
				res.status(201).json({success:false, message:"There was a problem getting user info."});
			}
			else{
			var response = user.uv; 
			res.status(200).json({message:response});
			} 
		});
	}); 
});




router.post('/addActivity', function(req, res){
  var tempLon = req.body.x.trim().split(" "); 
  for (var i=0; i<tempLon.length; i++){
    tempLon[i] = Number(tempLon[i]); 
  }
  var tempLat = req.body.y.trim().split(" "); 
  for (var i=0; i<tempLat.length; i++){
    tempLat[i] = Number(tempLat[i]); 
  }

  var lon = tempLon[0]; 
  var lat = tempLat[0]; 
  var temp; 
  var humidity; 
  request('http://api.openweathermap.org/data/2.5/weather?appid=3490e16b360f6439a58121daf7f5d631&lat='+lat+'&lon='+lon, {json:true},(err, res, body) =>{
    if(err){
      console.log("failed request");
    }
    else{
    global.tempGlobal = ((Number(body.main.temp)-273.15)*9/5+32).toFixed(2); 
    global.humidityGlobal = Number(body.main.humidity); 
    }

  });
	var time = new Date(); 
      var timeNow = time.getTime(); 
  
  var tempUV = req.body.u.trim().split(" ");
  for(var i=0; i<tempUV.length; i++){
    tempUV[i] = Number(tempUV[i]); 
  } 

  var tempS = req.body.s.trim().split(" ");
  var sumSpeed = 0;
  for(var i=0; i<tempS.length; i++){
    tempS[i] = Number(tempS[i]); 
    sumSpeed += tempS[i]; 
  } 

  var duration = ((15*tempS.length)/60).toFixed(2); 
  var averageSpeed = (sumSpeed/tempS.length).toFixed(2);

  if(averageSpeed < 4){
    var activity = "Walk";
    var calories = 7.6*duration; 
  }
  else if (averageSpeed < 8){
    var activity = "Run";
    var calories = 13.2*duration; 
  }
  else{
    var activity = "Bike";
    var calories = 10*duration;  
  }

  let newActivity = new Activities({
    deviceId:req.body.Id, 
    longitude:tempLon, 
    latitude:tempLat, 
    date:req.body.d,
    unix:timeNow, 
    uv:tempUV,
    speed:tempS,
    duration:duration, 
    type:activity,
    calories:calories,
    temp:global.tempGlobal, 
    humidity:global.humidityGlobal 
  });

  newActivity.save(function(err, newActivity){
    if(err){
      res.send("Nope"); 
    }
    else{
      res.send("yup"); 
    }
  })
});


router.post('/delete', function(req, res, next){
  if(!req.body.hasOwnProperty("deviceId")) {
     res.status(200).json({success:false, message:"Missing deviceId"});
  }

	if(!req.headers["x-auth"]){
   		res.status(400).json({success:false, message: "Invalid Credentials."}); 
  	}
  	else{
    	var token = req.headers["x-auth"];
    	try{
      		var decoded = jwt.decode(token, secret);
      		var query = {id:req.body.deviceId};
      		Devices.findOne(query, function(err, device){
        		if(err){
          			res.status(201).json({success:false, message:"Could not locate users account"});
        		}
        		else if(device){
            		if(device.email == decoded.email){
              			Devices.deleteOne({id: req.body.deviceId}, function(err, obj) {
                			if(err){
                  				res.status(200).json({success:false, message:"There was an issue deleting this device."}); 
                			}
                			res.status(203).json({success:true, message:"Device Deleted."});
              			});
            		}
            		else{
            			res.status(200).json({success:false, message:"No device registered with that device id."});
            		}
        		}
        		else{
        			res.status(200).json({success:false, message:"No device registered with that device id."});
        		}
      		});
    	}
    	catch(ex){
     		res.status(204).json({success:false, message:"Invalid JWT."});
    	}
  	}
}); 



router.post('/updateType', function(req, res, next){
	if(!req.headers["x-auth"]){
		res.status(400).json({success:false, message: "Invalid Credidentials"})
	}
	var query = {unix:req.body.unix};
	Activities.findOne(query, function(err,activity){
    	if(err){
    		res.status(400).json({success:false, message:"Bad User Update"});
    	}
    	else{
    	        var newVal = {
        		    deviceId:doc.deviceId, 
            		longitute:doc.longitude, 
              		latitude:doc.latitude, 
  	    	   	    uv:doc.uv, 
    	        	date:doc.date,
            	  	speed:doc.speed,
        	      	temp:doc.temp,
           		   	humidity:doc.humidity,
           		   	calories:doc.calories,
              		type:req.body.type,
              		duration:doc.duration
            	}

            	Activities.updateOne(activity, newVal, function(err, newActivity){
            		if(err){
           		     	res.status(400).json({success:false, message:"Bad Device.updateOne"});
              		}
            	});
        	}
 			res.status(200).json({success:true, message:"yea boy"});
    	
  	});
});


router.post('/replace', function(req, res, next){
      if(!req.body.hasOwnProperty("oldDeviceId")) {
     res.status(200).json({success:false, message:"Missing deviceId"});
  }

  if(!req.body.hasOwnProperty("newDeviceId")) {
     res.status(200).json({success:false, message:"Missing deviceId"});
  }
    if(!req.body.hasOwnProperty("apikey")) {
     res.status(200).json({success:false, message:"Missing apikey"});
  }

    if(!req.headers["x-auth"]){
      res.status(400).json({success:false, message: "Missing X-Auth header"}); 
    } 
	else{
  		var token = req.headers["x-auth"]; 
   		try{
    		var decoded = jwt.decode(token, secret); 
    		var query = {id:req.body.oldDeviceId}; 
   			Devices.findOne(query, function(err, devices){
  				if (err){
  					res.status(200).json({success:false, message:"There was an issue finding the device you want to replace."});
  				}
  				else if (devices){
  					if(devices.email == decoded.email){
  						Devices.findOne({id:req.body.newDeviceId}, function(err, newDevice){
  							if(err){
  								res.status(201).json({success:false, message:"There was an issue with the devices database"});
  							}
  							else if (!newDevice){
  								var newVal = {id:req.body.newDeviceId, email: decoded.email, apikey:req.body.apikey};
  								Devices.updateOne(query, newVal, function(err, device){
    								if(err){
      									res.status(202).json({success:false, message:"Device was not updated properly."}); 
    								}
    								else{
      									Activities.find(query, function(err, activities){
      										if(err){
      											res.status(203).json({success:false, message:"Problem with activities database"});
      										}
      										else{
      											for (var doc of activities){
      												var updatedActivity = {
									        		    deviceId:newDeviceId, 
            											longitute:doc.longitude, 
              											latitude:doc.latitude, 
  	    	   	    									uv:doc.uv, 
    	        										date:doc.date,
    	        										unix:doc.unix,
            	  										speed:doc.speed,
        	      										temp:doc.temp,
           		   										humidity:doc.humidity,
           		   										calories:doc.calories,
              											type:doc.type,
  	           											duration:doc.duration      												
      												}
      											
      												Activities.updateOne(doc, updatedActivity, function(err, newAct){
      													if(err){
      														res.status(204).json({success:false, message:"Activity not updated properly"});
      													}
      												});
      											}
                            res.status(205).json({success:true, message:"Updated properly."});
      										}
      									}) ;
    								}
  								});
  							}
  							else{
  								res.status(206).json({success:false, message:"Device Id is already being used."});
  							}
  						});			
  					}
  				}
  				else{
  					res.status(207).json({success:false, message:"Could not locate the device you want to replace."});
  				}
  			});	
		}
		catch (ex) {
    		res.status(208).json({success:false, message:"Invalid JWT"});
  		}
	}
});


router.get('/all', function(req, res, next){
	if(!req.headers["x-auth"]){
		res.status(201).json({success:false, message: "Missing X-Auth header"}); 
	} 

	var token = req.headers["x-auth"]; 
	try{
		var decoded = jwt.decode(token, secret); 
	}
	catch (ex) {
        	responseJson.message = "Invalid authorization token.";
        	return res.status(202).json({message:"badToken"});
    	}

	let responseJson = { devices: [] };

	Devices.find({email:decoded.email}, function(err, device){
		if(err){
			res.status(210).json({success:false, email:decoded.email, message:"No devices found"}); 
		}
		else{
			for(var doc of device){
				responseJson.devices.push({"deviceId":doc.id, "deviceName":doc.name, "deviceAPI":doc.apikey}); 		
			}
			res.status(200).json(responseJson); 
		} 
	}); 
});



router.get('/activities', function(req, res, next){

  var id = req.headers["device"]; 

  let responseJson = { activities: [] };

  Activities.find({deviceId:id}, function(err, activity){
    if(err){
      res.status(400).json({success:false, message:"No devices found"}); 
    }
    else{
      for(doc of activity){
           responseJson.activities.push({"deviceId":doc.deviceId,"longitude":doc.longitude,"latitude":doc.latitude,"uv":doc.uv,"date":doc.date,"unix":doc.unix, "speed":doc.speed,"temp":doc.temp,"humidity":doc.humidity,"calories":doc.calories,"type":doc.type,"duration":doc.duration}); 
      }
      res.status(200).json(responseJson); 
    } 
  }); 
});




// // GET request return one or "all" devices registered and last time of contact.
// router.get('/status/:devid', function(req, res, next) {
//   let deviceId = req.params.devid;
//   let responseJson = { devices: [] };

//   if (deviceId == "all") {
//     let query = {};
//   }
//   else {
//     let query = {
//       "deviceId" : deviceId
//     };
//   }
  
//   Device.find(query, function(err, allDevices) {
//     if (err) {
//       let errorMsg = {"message" : err};
//       res.status(400).json(errorMsg);
//     }
//     else {
//       for(let doc of allDevices) {
//         responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
//       }
//     }
//     res.status(200).json(responseJson);
//   });
// });

router.post('/register', function(req, res, next) {
  if(!req.body.hasOwnProperty("deviceId")) {
  	res.status(200).json({success:false, message:"Missing deviceId"});
	}

    if(!req.headers["x-auth"]){
    res.status(201).json({success:false, message: "Missing X-Auth header"}); 
    } 

    else{
    	try {
  		  let decoded = jwt.decode(req.headers["x-auth"], secret);

         Devices.findOne({id: req.body.deviceId }, function(err, device) {
          if(err){
            res.status(200).json({success:false, message: "Problem finding deviceId"}); 
          }

          else if (!device) {
            //res.status(201).json({success:false, message:"Device was previously registered."});
            deviceApikey = getNewApikey();
      
            let newDevice = new Devices({
                id: req.body.deviceId,
                email: decoded.email,
                apikey: deviceApikey
             });

      // Save device. If successful, return success. If not, return error message.
      newDevice.save(function(err, newDevice) {
        if (err) {
          res.status(202).json({success:false, message:"Failed to save device."}); 
        }
          res.status(203).json({success:true, message: "Saved new device."});
        
      });

          }
    
          else {   
            res.status(201).json({success:false, message:"Device was previously registered."});
    }
  });




  		  
  	}
  	catch (ex) {
    	responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  

});


// router.post('/ping', function(req, res, next) {
//   let responseJson = {
//     success: false,
//     message : "",
//   };
//   let deviceExists = false;
    
//   // Ensure the request includes the deviceId parameter
//   if( !req.body.hasOwnProperty("deviceId")) {
//     responseJson.message = "Missing deviceId.";
//     return res.status(400).json(responseJson);
//   }
    
//   // If authToken provided, use email in authToken 
//   try {
//     let decodedToken = jwt.decode(req.headers["x-auth"], secret);
//   }
//   catch (ex) {
//     responseJson.message = "Invalid authorization token.";
//     return res.status(400).json(responseJson);
//   }
    
//   request({
//     method: "POST",
//     uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/pingDevice",
//     form: {
// 	    access_token : particleAccessToken,
// 	    args: "" + (Math.floor(Math.random() * 11) + 1)
//     }
//   });
            
//   responseJson.success = true;
//   responseJson.message = "Device ID " + req.body.deviceId + " pinged.";
//   return res.status(200).json(responseJson);
// });

module.exports = router;