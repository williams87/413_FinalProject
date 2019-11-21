var express = require('express');
var router = express.Router();
var Users = require("../models/users");
var Devices = require("../models/devices");
var Activities = require("../models/activities");
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
var secret = "supersecret";
var jwt = require('jwt-simple');
var bcrypt = require("bcrypt-nodejs"); 



router.post('/user', function(req, res){
	bcrypt.hash(req.body.password, null, null, function(err, hash){
		var newuser = new Users({
			email:req.body.email,
			name:req.body.name,
			password:hash
		});
		var query = {email:req.body.email}; 
		Users.findOne(query, function(err, users){
			if(err){
				res.status(200).json({success:false, message:"There was a problem accessing account information. Please try again later."});  
			}
			else if(!users){
				newuser.save(function(err, newuser){
					if (err){
						res.status.json({success:false, message:"There was a problem registering this account. Please try again later."}); 	 
					}
					else{
						res.status(200).json({success:true, message:"Thank you for registering an account."}); 
					}
				});
			}
			else{
				res.status(200).json({success:false, message:"Email was previously registered."});
			}
		});
	});
});


router.post('/auth', function(req,res){
	var query = {email:req.body.email};
	Users.findOne(query, function(err, user){
		if(err){
			res.status(200).json({success:false, message:"There was a problem accessing account information. Please try again later."}); 
		}
		if(!user){
			res.status(200).json({success:false, message:"Could not locate an account registered to that email."}); 
		}
		else {
			bcrypt.compare(req.body.password, user.password, function(err, valid){
				if (err) {
					res.status(200).json({success:false, message:"There was a problem accessing account information. Please try again later."}); 
				}
				else if (valid) {
					var token = jwt.encode({email: user.email}, secret);
					res.status(200).json({success:true, token:token}); 
				}
				else{
					res.status(200).json({success:false, message:"Invalid password."}); 
				}
			});
		}
	});
});


router.get('/status', function(req, res){
	if(!req.headers["x-auth"]){
		res.status(201).json({success:false, message: "Invalid credentials to access account."});
	}
	var token = req.headers["x-auth"]; 
	try{
		var decoded = jwt.decode(token, secret);
		var userStats = {};
		var query = {email:decoded.email};
		Users.find(query, function(err, user){
			if(err){
				res.status(202).json({success:false, message:"Account could not be found."}); 
			}
			else{
				for(var doc of user){
					userStats['success'] = true; 
					userStats['email'] = doc.email; 
					userStats['name'] = doc.name;
					userStats['uv'] = doc.uv;
					res.status(203).json(userStats);
				}  
			}			
		});		

	}
	catch(ex){
		res.status(204).json({success:false, message:"Invalid JWT"});
	}
});


router.post('/update', function(req,res){
	bcrypt.hash(req.body.password, null, null, function(err, hash){
	 	if(!req.headers["x-auth"]){
	 		res.status(200).json({success:false, message:"Invalid credentials"});
	 	}
	 	else{
	 		var token = req.headers["x-auth"]; 
	 		try{
	 			var decoded = jwt.decode(token, secret); 
	 			var query = {email:decoded.email}; 
	 			Users.find(query, function(err, user){
	 				if(err){
	 					res.status(201).json({success:false, message:"Not Found"}); 
	 				}
	 				else{
	 					for (var doc of user){
	 						var updatedRecord = {
	 							email:req.body.email,
	 							name:req.body.name,
	 							password:hash,
	 							uv:req.body.uv 
	 						}
	 						Users.findOne({email:req.body.email}, function(err, newUser){
	 							if(err){
	 								res.status(207).json({success:false, message:"Database is experiencing issues."});
	 							}
	 							else if(!newUser){
			 						Users.updateOne(query, updatedRecord, function(err, users){
	 									if(err){
	 										res.status(202).json({success:false, message:"Account did not update properly."}); 
	 									}
	 								});
	 								Devices.find(query, function(err,device){
	 									if(err){
	 										res.status(205).json({success:false, message:"There was a problem locating one of the devices."})
	 									}
	 									else{
	 										for (var doc2 of device){
	 											var updatedDevice = {
	 												id:doc2.id,
	 												email:req.body.email,
	 												apikey:doc2.apikey
	 											}
	 											Devices.updateOne(query, updatedDevice, function(err,devices){
	 												if(err){
	 													res.status(206).json({success:false, message:"Device not properly updated"});
	 												}
	 											});
	 										}
	 									}
	 								});
	 								var token2 = jwt.encode({email: req.body.email}, secret);
	 								res.status(203).json({success:true, token:token2}); 
	 							}
	 							else{
	 								res.status(208).json({success:false, message:"Email is not available"});
	 							}
	 						});	
	 					}
	 				}
	 			});
	 		}
	 		catch(ex){
	 			res.status(204).json({success:false, message:"Nope"});
	 		}
	 	}
	});
});	
						

router.post('/UV', function(req, res){
	if(!req.body.hasOwnProperty("uv")){
		res.status(200).json({success:false, message:"Missing uv value."});
	}

	if(!req.headers["x-auth"]){
		res.status(200).json({success:false, message:"Invalid credentials"});
	}
	else{
	var token = req.headers["x-auth"];
	try{
		var decoded = jwt.decode(token, secret); 
		var query = {email:decoded.email};
		Users.find(query, function(err, user){
			if(err){
				res.status(200).json({success:false, message:"There was a problem accessing this account."}); 
			}
			else{
				for(var doc of user){
					var update = {
						email:doc.email,
						name:doc.name,
						password:doc.password,
						uv:req.body.uv
					}
					Users.updateOne(doc, update, function(err, users){
						if(err){
							res.status(200).json({success:false, message:"There was a problem updating the UV information for this account."});
						}
						res.status(200).json({success:true, message:"UV was properly updated."});
					});
				}
			}
		});
	}
	catch(ex){
		res.status(200).json({success:false, message:"Invalid entry."}); 
	}
}
});	


module.exports = router; 