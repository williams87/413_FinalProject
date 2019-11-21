
"use strict";

window.addEventListener("DOMContentLoaded", load); 

function load(){
	if(!window.localStorage.getItem("authToken")){
		window.location.replace("login_page.html"); 
	}

	else{

    sendReqForAccountInfo(); 
		getDevices(); 
	}
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




function getDevices(){
	$.ajax({
		url: '/devices/all', 
		type: 'GET', 
		headers: { 'x-auth': window.localStorage.getItem("authToken") }, 
		dataType: 'json', 
	})
	.done(function(data, textStatus, jqXHR){
      for (var device of data.devices) {
        showActivities(device);
      } 
  })
	.fail(function(jqXHR, textStatus, errorThrown){
    alert("failed getDevices"); 
    let response = JSON.parse(jqXHR.responseText);
    $("#error").html("Error: " + response.message);
    $("#error").show(); 	
  })
}


function showActivities(device){
    $.ajax({
    url: '/devices/activities', 
    type: 'GET', 
    headers: { 'device': device.deviceId }, 
    dataType: 'json', 
  })
  .done(function(data, textStatus, jqXHR){


    for (var activity of data.activities) {
     if(typeof(activity.temp)!=="undefined"){ //alert(activity.uv); 

     	console.log(activity.date); 

      var list = $("<ul class='collection with-header'></ul>"); 
      list.attr('id', "ul"+activity.date); 


      var header = $("<h5></h5>"); 
      header.html(activity.date); 

      var date = $("<li class='collection-header'></li>"); 
      date.append(header); 
      list.append(date);  
  
      var duration = $("<li class = 'collection-item'></li>"); 
      duration.html("Duration: "+activity.duration+' Minutes'); 
      list.append(duration); 

      var sum = 0; 
      for (var i = 0; i<activity.uv.length; i++){
        sum += activity.uv[i]; 
      }
      var uv = $("<li class = 'collection-item'></li>"); 
      uv.html("UV Exposure: "+sum); 
      list.append(uv); 

      var temp = $("<li class = 'collection-item'></li>"); 
      temp.html("Temperature: "+activity.temp+'\u00B0'+'F'); 
      list.append(temp); 

      var humidity = $("<li class = 'collection-item'></li>"); 
      humidity.html("Humidty: "+activity.humidity+"%"); 
      list.append(humidity); 

      var type = $("<li class = 'collection-item'></li>"); 
      type.html("Type of Workout: "+activity.type); 
      list.append(type); 

      var cals = $("<li class = 'collection-item'></li>"); 
      cals.html("Calories Burned: "+activity.calories); 
      list.append(cals); 

      var summary = $("<li class = 'collection-item'></li>"); 
      summary.attr('id', 'summary'+activity.date);


      var link = $("<a href = '#!' style = 'padding-right:10px;'></a>");
      link.click(function(){
        alert("now this"); 
        $(this).parent().parent().children().eq(8).slideDown();
        $(this).parent().parent().children().eq(7).hide();
      })

      link.attr('id', 'link '+activity.date); 
      link.html("Additional Information");

 
      var updateType = $("<a href = '#!'></a>"); 
      updateType.click(function(){
        $(this).parent().parent().children().eq(9).slideDown(); 
        $(this).parent().parent().children().eq(7).hide(); 
      });

      updateType.html("Change Workout Type"); 



      summary.append(link); 
      summary.append(updateType); 
      list.append(summary); 

      var summaryForm = $("<li class='colection-item'></li>"); 

      var speedDiv = $("<div style='padding-bottom:10px;height: 370px; width: 100%;'></div>");
      speedDiv.attr('id', 'speedContainer' + activity.date); 
      var uvDiv = $("<div style='padding-bottom:10px;height: 370px; wide:100%;'></div>");
      uvDiv.attr('id', 'uvContainer' + activity.date); 

      var button = $("<button class='waves-effect waves-light btn'></button>"); 
      button.html("Cancel"); 
      button.click(function(){
        $(this).parent().parent().children().eq(8).slideUp(); 
        $(this).parent().parent().children().eq(7).show(); 
        
      })
      summaryForm.append(speedDiv);
      summaryForm.append(uvDiv);  
      summaryForm.append(button);
      summaryForm.hide();  
      
      list.append(summaryForm); 
         

      var updateForm = $("<li class = 'collection-item'></li>");
      var updateDiv = $("<div></div>");
      var walk = $("<input type='radio' style = 'padding-right:10px;' name = 'walk' val = 'walk'>"); 
      walk.html("Walk"); 
      var run = $("<input type = 'radio' style = 'padding-right:10;' name = 'run' val = 'run'>"); 
      var bike = $("<input type='radio' style = 'padding-right:10px' name='bike' val = 'bike'>");
      updateDiv.append(walk); 
      updateDiv.append(run); 
      updateDiv.append(bike);
      updateForm.append(updateDiv);  
       
      //list.append(updateForm); 


      var typeButtonCancel = $("<button class='waves-effect waves-light btn'></button>"); 
      typeButtonCancel.html("Cancel"); 
      typeButtonCancel.click(function(){
        $(this).parent().parent().children().eq(9).slideUp(); 
        $(this).parent().parent().children().eq(7).show(); 
        
      })
      updateForm.append(typeButtonCancel); 
      updateForm.hide();
      list.append(updateForm);

      updateForm.append(typeButtonCancel); 
      $('#summaryDiv').append(list); 
        drawSpeedGraph(activity.speed, activity.date);
        drawUVGraph(activity.uv, activity.date);
 
    }
  }
     })
  .fail(function(jqXHR, textStatus, errorThrown){
    alert("Failed show activities"); 
  })  
  }
     


function sendReqForWeatherInfo(id) {
  alert("function"); 
  $.ajax({
    url: 'http://api.openweathermap.org/data/2.5/forecast?appid=3490e16b360f6439a58121daf7f5d631&lat=32.2226&lon=-110.9747',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(data, textSatus, jqXHR){ 
      var weatherInfo = data.list; 
      updateWeather(weatherInfo,id); 

  })
  .fail(function(jqXHR, textStatus, errorThrown){
    alert("fail send for weather"); 

  })
}


function drawSpeedGraph(speedData, date){
	alert("drawGraph"); 
  var d = []; 
  var time = 0; 
  for (var i = 0; i<speedData.length; i++){
    var set = {x:time, y:speedData[i]};
    d.push(set); 
    time+=15; 
  }

  var chart = new CanvasJS.Chart(("speedContainer"+date), {
  
  animationEnabled: true,
  theme: "light2",
  title:{
    text: "Speed During Workout"
  },
  axisX:{
    title: "Time in Seconds"
  },
  axisY:{
    title: "Speed in Knots",
    includeZero: false
  },
  data: [{        
    type: "line",       
    dataPoints: d
  }]
});
  chart.render();
}

function drawUVGraph(uvData,date){

  var d = []; 
  var time = 0; 
  var sum = 0; 
  for (var i = 0; i<uvData.length; i++){
    sum+=uvData[i]; 
    var set = {x:time, y:sum};
    d.push(set); 
    time+=15; 
  }

  var chart = new CanvasJS.Chart("uvContainer"+date, {
  
  animationEnabled: true,
  theme: "light2",
  title:{
    text: "UV Exposure During Workout"
  },
  axisX:{
    title: "Time in Seconds",
    includeZero: false,
    crosshair: {
      enabled: true,
      snapToDataPoint: true
    },
  },
  axisY:{
    title: "UV Received",
    includeZero: true,
    crosshair: {
      enabled: true
    },
    includeZero: false
  },
  data: [{        
    type: "line",       
    dataPoints: d
  }]
});
  chart.render();
}
