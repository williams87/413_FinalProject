
"use strict";

window.addEventListener("DOMContentLoaded", load); 

function load(){
	if(!window.localStorage.getItem("authToken")){
		window.location.replace("login_page.html"); 
	}

	else{
		sendReqForAccountInfo(); 
		$("#updateAccount").click(showUpdateAccountForm); 
    	$("#registerDevice").click(showRegisterDeviceForm); 
		$("#deleteDevice").click(showDeleteDeviceForm);
		$("#replaceDevice").click(showReplaceDeviceForm); 
    	$("#updateUltraViolet").click(showUVForm); 

	    $("#updateAccountButton").click(checkIfValid); 
		  $("#registerDeviceButton").click(registerDevice); 
   		$("#deleteDeviceButton").click(deleteDevice);  
    	$("#replaceDeviceButton").click(replaceDevice);
    	$("#updateUVButton").click(updateUV); 

	    $("#cancelUpdateAccountButton").click(hideUpdateAccountForm);  
  		$("#cancelRegisterButton").click(hideRegisterDeviceForm);
  		$("#cancelDeleteButton").click(hideDeleteDeviceForm);
  		$("#cancelReplaceButton").click(hideReplaceDeviceForm);
    	$("#cancelUVButton").click(hideUVForm); 

		$("#signout").click(function(){
			window.localStorage.removeItem('authToken');
			window.location.replace("login_page.html"); 
		});

    	$("#newPassword").focus(checkPassword); 
    	$("#newPassword").blur(function(){
      		$("#passwordErrors").css("display", "none"); 
      		$("#submit").css("display", "block"); 
    	});
  
    	$("#newPasswordConfirm").focus(checkPassword); 
    	$("#newPasswordConfirm").blur(function(){
      		$("#passwordErrors").css("display", "none"); 
      	$("#submit").css("display", "block"); 
    	});


    	$(".pr").css("color", "red");  
    	$(".match").css("color", "green");
    	$("#passwordErrors").css("display", "none")    
    	$("input").focus(function(){
      		$("#updateErrorsList").html(""); 
    	}); 
	}
}


function sendReqForAccountInfo() {
  var token = window.localStorage.getItem("authToken"); 
  $.ajax({
   	url: '/login/status',
   	type: 'GET',
   	headers: { 'x-auth': token },
   	dataType: 'json'
  })
  .done(function(data, textSatus, jqXHR){
    $("#email").html(data.email);
    $("#fullName").html(data.name);
    $("#uv").html(data.uv);
    $("#main").show();
    showDevices(); 
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


function showDevices(){
	$.ajax({
		url: '/devices/all', 
		type: 'GET', 
		headers: { 'x-auth': window.localStorage.getItem("authToken") }, 
		dataType: 'json', 
	})
	.done(function(data, textStatus, jqXHR){
    	for (var device of data.devices) {
    		$("#registerDeviceForm").before("<li class='collection-item'>ID: " +
      		device.deviceId + ", APIKEY: " + device.deviceAPI + 
      		" </li>");
    	}
  	})
	.fail(function(jqXHR, textStatus, errorThrown){
    let response = JSON.parse(jqXHR.responseText);
    $("#error").html("Error: " + response.message);
    $("#error").show(); 	
  })
}


function registerDevice() {
 	$.ajax({
 		url: '/devices/register',
 		type: 'POST',
 		headers: { 'x-auth': window.localStorage.getItem("authToken") },  
 		contentType: 'application/json',
 		data: JSON.stringify({ deviceId: $("#registerDeviceId").val(), email:$("#email").val()}), 
 		dataType: 'json'
 	})
 	.done(function(data, textStatus, jqXHR){
    if(data.success){
      window.location.replace("account_page.html");
    }
    else{
        let errorList = $("#updateDeviceErrorsList"); 
        errorList.html(""); 
        let error = $("<li></li>").text(data.message); 
        errorList.append(error);
        $("#deviceErrors").show(); 
    }
  }) 
 	.fail(function(jqXHR, textStatus, errorThrown){
        let errorList = $("#updateDeviceErrorsList"); 
        errorList.html(""); 
        let error = $("<li></li>").text(response.message); 
        errorList.append(error);
        $("#deviceErrors").show(); 
  })
}


function deleteDevice(){
  $.ajax({
    url: '/devices/delete', 
    type: 'POST', 
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    contentType: 'application/json', 
    data: JSON.stringify({deviceId: $("#deleteDeviceId").val()}), 
    dataType: 'json' 
  })
  .done(function(data, textStatus, jqXHR){
  	if(data.success){
    	window.location.replace("account_page.html");
	}
	else{
        let errorList = $("#updateDeviceErrorsList"); 
        errorList.html(""); 
        let error = $("<li></li>").text(data.message); 
        errorList.append(error);
        $("#deviceErrors").show(); 
	}
  })
  .fail(function(jqXHR, textStatus, errorThrown){
        let errorList = $("#updateDeviceErrorsList"); 
        errorList.html(""); 
        let error = $("<li></li>").text(response.message); 
        errorList.append(error);
        $("#deviceErrors").show(); 
  })
}


function replaceDevice(){
  $.ajax({
    url: '/devices/replace', 
    type: 'POST', 
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    contentType: 'application/json', 
    data: JSON.stringify({oldDeviceId: $("#replaceDeviceIdOld").val(), newDeviceId:$("#replaceDeviceIdNew").val(), email:$("#email").val(),apikey:"3yS02JYqqR3LqfOQRt5uAlU6QC3p0cN8"}), 
    dataType: 'json' 
  })
  .done(function(data, textStatus, jqXHR){
    if(data.success){
      window.location.replace("account_page.html");
    }
    else{
      let errorList = $("#updateDeviceErrorsList"); 
      errorList.html(""); 
      let error = $("<li></li>").text(data.message); 
      errorList.append(error);
      $("#deviceErrors").show();
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown){
      if(jqXHR.status == 205){
        window.location.replace("account_page.html");
      }
      else{
        let errorList = $("#updateDeviceErrorsList"); 
        errorList.html(""); 
        let error = $("<li></li>").text(jqXHR.message); 
        errorList.append(error);
        $("#deviceErrors").show();
      }  
  })
}


function updateUV(){
  var uv = $("#uvThreshold").val(); 
  if(uv>100 || uv<0){
    let errorList = $("#updateUVErrorsList"); 
    errorList.html(""); 
    let error = $("<li></li>").text("UV range should be a number between 0 and 100"); 
    errorList.append(error);
    $("#uvErrors").show(); 
  } 

  else if(!($.isNumeric(uv))){
    let errorList = $("#updateUVErrorsList"); 
    errorList.html(""); 
    let error = $("<li></li>").text("UV range should be a number between 0 and 100"); 
    errorList.append(error);
    $("#uvErrors").show(); 
  }

else{

  $.ajax({
    url: '/login/UV', 
    type: 'POST', 
    headers: {'x-auth': window.localStorage.getItem("authToken")},
    contentType: 'application/json', 
    data: JSON.stringify({uv:$("#uvThreshold").val()}),
    dataType: 'json'
  })
  .done(function(data, textStatus, jqXHR){
    window.location.replace("account_page.html"); 
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    let response = JSON.parse(jqXHR.responseText);
    $("#error").html("Error: " + response.message);
    $("#error").show();
  })  
}
}

function showUpdateAccountForm(){
  $("#newEmail").val(""); 
  $("#newName").val(""); 
  $("#newPassword").val(""); 
  $("#newPasswordConfirm").val(""); 
  $("#update").hide(); 
  $("#updateAccountForm").slideDown(); 
}


function hideUpdateAccountForm(){
  $("#update").show(); 
  $("#updateAccountForm").slideUp(); 
  $("#updateErrorsList").html("");
  $("#errors").hide(); 
}


function showRegisterDeviceForm() {
	$("#registerDeviceId").val("");        
	$("#deviceName").val("");
 	$("#deviceControl").hide();   
 	$("#registerDeviceForm").slideDown();  
}


function hideRegisterDeviceForm() { 
 	$("#deviceControl").show();  
 	$("#registerDeviceForm").slideUp();  
  $("#deviceErrors").hide();
}


function showDeleteDeviceForm(){
	$("#deleteDeviceId").val(""); 
	$("#deviceControl").hide();
	$("#deleteDeviceForm").slideDown(); 
}


function hideDeleteDeviceForm(){
	$("#deviceControl").show();  
  $("#deleteDeviceForm").slideUp();  
  $("#deviceErrors").hide();
}


function showReplaceDeviceForm(){
	$("#replaceDeviceIdOld").val("");
	$("#replaceDeviceIdNew").val("");  
	$("#deviceControl").hide();
	$("#replaceDeviceForm").slideDown(); 
}


function hideReplaceDeviceForm(){ 
	$("#deviceControl").show();  
  $("#replaceDeviceForm").slideUp();  
  $("#deviceErrors").hide();
}


function showUVForm(){
  $("#uvThreshold").html(""); 
  $("#updateUV").hide(); 
  $("#uvForm").slideDown();   
}


function hideUVForm(){
  $("#updateUV").show(); 
  $("#uvForm").slideUp(); 
  $("#uvErrors").hide();
}


function checkIfValid(){
  let is_it_valid = true; 
  let email = $("#email").val();
  let userName = $("#newName").val(); 
  let userEmail = $("#newEmail").val(); 
  let userPassword = $("#newPassword").val(); 
  let confirmPassword = $("#newPasswordConfirm").val();
  let uvExposure = $("#uv").val();  
  let errorList = $("#updateErrorsList");
  errorList.html("");   
  let regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  let regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*^()]).{8,20}$/;
  
  if (userName.length < 1){ 
    let error = $("<li></li>").text("Missing name."); 
    error.css("color", "red"); 
    errorList.append(error);
    is_it_valid = false;  
  }
  
  if (!(regexEmail.test(userEmail))){
    let error = $("<li></li>").text("Invalid email address."); 
    error.css("color", "red"); 
    errorList.append(error);
    is_it_valid = false;
  }

  if(!regexPassword.test(userPassword)){
    let error = $("<li></li>").text("Invalid password."); 
    error.css("color", "red"); 
    errorList.append(error);
    is_it_valid = false;
  }

  if (userPassword != confirmPassword){
    let error = $("<li></li>").text("Passwords don't match."); 
    error.css("color", "red"); 
    errorList.append(error);
    is_it_valid = false;
  }

  if(is_it_valid){
    $.ajax({
      url: '/login/update',
      type: 'POST', 
      headers: {'x-auth': window.localStorage.getItem("authToken")},
      contentType: 'application/json',
      data: JSON.stringify({email:userEmail, name:userName, password:userPassword, uv:uvExposure}), 
      dataType: 'json'
    })
    .done(function(data, textStatus, jqXHR){
      if(data.success){
      	window.localStorage.clear();
      	window.localStorage.setItem("authToken", data.token); 
        window.location.replace("account_page.html");
      } 
      else{
        let errorList = $("#updateErrorsList"); 
        errorList.html(""); 
        let error = $("<li></li>").text(data.message); 
        errorList.append(error);
        $("#errors").show(); 
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown){
      let errorList = $("errorsList"); 
      errorList.html(""); 
      let error = $("<li></li>").text("There is a problem with the server. Please try again."); 
      errorList.append(error); 
      $("#errors").show();
    })
  }

  else{
    $("#errors").show();  
  }
}


function checkPassword(event){
  $("#passwordErrors").css("display", "block");
  $("#passwordErrors").css("marginBottom", "10px");  
  $(".password_input").keyup(function(){
    let pass = $("#newPassword").val();
    let passConfirm = $("#newPasswordConfirm").val(); 
    let regexLower = /[a-z]/;
    let regexUpper = /[A-Z]/;
    let regexNumber = /[0-9]/;
    let regexSpecialChar = /[!@#$%&*^()]/;
    let length = $("#length");  
    let lowerCase = $("#lowerCase"); 
    let upperCase = $("#upperCase"); 
    let number = $("#number"); 
    let specialChar = $("#specialCharacter"); 
    let match = $("#match"); 
    
    if ((pass.length < 8) || (pass.length > 20)){
      length.css("color", "red"); 
    }
    else{
      length.css("color", "green"); 
    } 

    if(!regexLower.test(pass)){
      lowerCase.css("color", "red");  
    }
    else{
      lowerCase.css("color", "green"); 
    }   
    
    if(!regexUpper.test(pass)){
      upperCase.css("color", "red"); 
    }
    else{
      upperCase.css("color", "green"); 
    }

    if(!regexNumber.test(pass)){
      number.css("color", "red"); 
    }
    else{
      number.css("color", "green"); 
    }

    if(!regexSpecialChar.test(pass)){
      specialChar.css("color", "red");  
    }
    else{
      specialChar.css("color", "green"); 
    }

    if(pass != passConfirm){
      match.css("color", "red"); 
    }

    else{
      match.css("color", "green"); 
    }
  });
}