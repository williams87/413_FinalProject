
"use strict";
    var uv = 0; 
    var duration = 0; 
    var calories = 0; 
window.addEventListener("DOMContentLoaded", load); 

// var uv = 0; 
// var duration = 0; 
// var calories = 0; 

function load(){
	if(!window.localStorage.getItem("authToken")){
		window.location.replace("login_page.html"); 
	}

	else{
  $("#duration").html(0); 
  $("#calories").html(0); 
  $("#uvExposure").html(0); 
  
  
		sendReqForAccountInfo(); 
    hideForcast();
    getDevices(); 
 
    $("#updateLocation").click(showUpdateLocationForm); 
    $("#updateLocationButton").click(sendReqForWeatherInfo); 
    $("#cancelUpdateLocationButton").click(hideUpdateLocationForm); 
  }
}



function hideForcast(){
  $("#day1").hide();
  $("#day2").hide();
  $("#day3").hide();
  $("#day4").hide();
  $("#day5").hide();
}

function showForcast(){
  $("#day1").show();
  $("#day2").show();
  $("#day3").show();
  $("#day4").show();
  $("#day5").show();
}



function sendReqForAccountInfo() {
  $.ajax({
    url: '/login/status',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
  .done(function(data, textSatus, jqXHR){
    $("#email").html(data.email);
    $("#fullName").html(data.name);
    $("#uv").html(data.uv);
    $("#main").show();
    
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    if( jqXHR.status === 401 ) {
      window.localStorage.removeItem("authToken");
      window.location.replace("login_page.html");
    } 
    else {
      let response = JSON.parse(jqXHR.responseText);
      $("#error").html("Error: " + response.message);
      $("#error").show();
    } 
  })
}

function sendReqForUVInfo() {
    var lat = $("#userLatitude").val(); 
  var lon = $("#userLongitude").val(); 
  //alert("function"); 
 	$.ajax({
   	url: 'http://api.openweathermap.org/data/2.5/uvi/forecast?appid=3490e16b360f6439a58121daf7f5d631&lat='+lat+'&lon='+lon,
   	type: 'GET',
   	dataType: 'json'
  })
  .done(function(data, textSatus, jqXHR){ 
    var uv = []; 
    for(var doc of data){
      uv.push(doc.value); 
    }

    $("#u1").html(uv[0]); 
    $("#u2").html(uv[1]); 
    $("#u3").html(uv[2]); 
    $("#u4").html(uv[3]); 
    $("#u5").html(uv[4]); 

    showForcast(); 


  })
  .fail(function(jqXHR, textStatus, errorThrown){
   // alert("fail"); 
    if( jqXHR.status === 401 ) {
      window.localStorage.removeItem("authToken");
      window.location.replace("login_page.html");
    } 
    else {
      let response = JSON.parse(jqXHR.responseText);
      $("#error").html("Error: " + response.message);
      $("#error").show();
    } 
  })
}


function sendReqForWeatherInfo() {
  var lat = $("#userLatitude").val(); 
  var lon = $("#userLongitude").val(); 
  //alert("function"); 
  $.ajax({
    url: 'http://api.openweathermap.org/data/2.5/forecast?appid=3490e16b360f6439a58121daf7f5d631&lat='+lat+'&lon='+lon,
    type: 'GET',
    dataType: 'json'
  })
  .done(function(data, textSatus, jqXHR){ 
    var humidity = [];
    var temp = []; 
    var header = [];  
    var count = 0;
    var weatherInfo = data.list;  

    if(lat > 0){
      $("#latitude").html(lat+'\u00B0'+"North"); 
    }
    else{
      var latString = String(lat); 
      var latString2 = latString.slice(1,-1); 
      $("#latitude").html(latString2+'\u00B0'+"South"); 
    }

    if(lon > 0){
      $("#longitude").html(lon+'\u00B0' + "East"); 
    }
    else{
      var lonString = String(lon); 
      var lonString2 = lonString.slice(1,-1); 
      $("#longitude").html(lonString2+'\u00B0'+"West"); 
    }


    $("#latitude").html(lat); 
    $("#longitude").html(lon); 

    for(var i = 0; i<weatherInfo.length; i++){
      if (i%8 == 4){
        humidity.push(weatherInfo[i]["main"].humidity); 
        var tk = Number(weatherInfo[i]["main"].temp);
        var tf = ((tk-273.15)*9/5+32).toFixed(2); 
        temp.push(tf);
        var date = weatherInfo[i]["dt_txt"]; 
        header.push(date.slice(0,10)); 
      }
      count++

    }

    $("#t1").html(temp[0] + '\u00B0'+"F"); 
    $("#t2").html(temp[1] + '\u00B0' +"F"); 
    $("#t3").html(temp[2] + '\u00B0' +"F"); 
    $("#t4").html(temp[3] + '\u00B0' +"F"); 
    $("#t5").html(temp[4] + '\u00B0' +"F");

    $("#h1").html(humidity[0] + "%"); 
    $("#h2").html(humidity[1] + "%"); 
    $("#h3").html(humidity[2] + "%"); 
    $("#h4").html(humidity[3] + "%"); 
    $("#h5").html(humidity[4] + "%");


    $("#head1").html(header[0]); 
    $("#head2").html(header[1]);
    $("#head3").html(header[2]);
    $("#head4").html(header[3]);
    $("#head5").html(header[4]);
    sendReqForUVInfo(); 


  })
  .fail(function(jqXHR, textStatus, errorThrown){
    alert("fail"); 
    // if( jqXHR.status === 401 ) {
    //   window.localStorage.removeItem("authToken");
    //   window.location.replace("login_page.html");
    // } 
    // else {
    //   let response = JSON.parse(jqXHR.responseText);
    //   $("#error").html("Error: " + response.message);
    //   $("#error").show();
    // } 
  })
}


function showUpdateLocationForm(){
  $("#newLatitude").val(""); 
  $("#newLongitude").val(""); 
  $("#location").hide(); 
  $("#updateLocationForm").slideDown(); 
}

function hideUpdateLocationForm(){
 $("#location").show(); 
  $("#updateLocationForm").slideUp();  
}



function getDevices(){
 // alert("getDevices"); 
  $.ajax({
    url: '/devices/all', 
    type: 'GET', 
    headers: { 'x-auth': window.localStorage.getItem("authToken") }, 
    dataType: 'json', 
  })
  .done(function(data, textStatus, jqXHR){
      //alert("passed getDevices"); 
      for (var device of data.devices) {
        showActivities(device);
      } 
      var duration = Number($("#duration").html()); 
           //alert(duration); 
           $("#duration").html(duration+ " Minutes");
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    //alert("failed getDevices"); 
    let response = JSON.parse(jqXHR.responseText);
    $("#error").html("Error: " + response.message);
    $("#error").show();   
  })
}


function showActivities(device){
    //alert("showActivities"); 
    $.ajax({
    url: '/devices/activities', 
    type: 'GET', 
    headers: { 'device': device.deviceId }, 
    dataType: 'json', 
  })
  .done(function(data, textStatus, jqXHR){

//alert("passed showActivities"); 
    for (var activity of data.activities) {
     if(typeof(activity.temp)!=="undefined"){ //alert(activity.uv); 
      //alert("inside if");
      // console.log(activity.temp);  
      var time = new Date(); 
      var timeNow = time.getTime(); 
     // console.log(timeNow); 
     // console.log(activity.unix);  
      if((timeNow - activity.unix) < 604800000){
         //alert("inside if timeNow"); 
        var uvSum = 0; 
          for (var i = 0; i<activity.uv.length; i++){
            uvSum += activity.uv[i]; 
          }

         // uv = uv + uvSum; 
         // duration = duration + activity.duration; 
         // calories =calories + activity.calories;  
 
           var duration = Number($("#duration").html()) + activity.duration; 
           //alert(duration); 
           $("#duration").html(duration);

           var calories = Number($("#calories").html()) + activity.calories; 
           $("#calories").html(calories); 

           var uv = Number($("#uvExposure").html()) + uvSum; 
           $("#uvExposure").html(uv); 

  // $("#calories").html(calories); 
  // $("#uvExposure").html(uv); 


      }
        
      }
  }
     })
  .fail(function(jqXHR, textStatus, errorThrown){
    alert("Failed show activities"); 
  })  
  }





