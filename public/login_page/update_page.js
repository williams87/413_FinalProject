
"use strict";

window.addEventListener("DOMContentLoaded", load); 

function load(){
	 
	$("#submit").click(checkIfValid); 
	pageSetup(); 	

	$("#password").focus(checkPassword); 
	$("#password").blur(function(){
		$("#passwordErrors").css("display", "none"); 
		$("#submit").css("display", "block"); 
	});
	
	$("#passwordConfirm").focus(checkPassword); 
	$("#passwordConfirm").blur(function(){
		$("#passwordErrors").css("display", "none"); 
		$("#submit").css("display", "block"); 
	});
}


function pageSetup(){
	$("#formErrors").css("display", "none");
	$("#passwordErrors").css("display", "none");
	$("#emailErrors").css("display", "none");   
	$(".pr").css("color", "red");	 
	$(".match").css("color", "green");
	$(".input").focus(function(){
		$("#formErrors").css("display", "none");
		$("#loginErrors").css("display", "none");  
	}); 
		
}


function clearFormsOnChange(){
	$(".input").val("");
	$(".password_input").val("");  
}


function checkPassword(event){
	$("#formErrors").css("display", "none"); 
	$("#submit").css("display", "none");
	$("#passwordErrors").css("display", "block");
	$("#passwordErrors").css("marginBottom", "10px");  
	$(".password_input").keyup(function(){
		let pass = $("#password").val();
		let passConfirm = $("#passwordConfirm").val(); 
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


function checkIfValid(){
	let is_it_valid = true; 
	let userName = $("#name").val(); 
	let userEmail = $("#email").val(); 
	let userPassword = $("#password").val(); 
	let confirmPassword = $("#passwordConfirm").val(); 
	let errorBlock = $("#errorList");
	errorBlock.html("");   
	let errors = $("#formErrors");
	let regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
	let regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*^()]).{8,20}$/;
	if (userName.length < 1){ 
		let error = $("<li></li>").text("Missing name."); 
		error.css("color", "red"); 
		errorBlock.append(error);
		is_it_valid = false;  
	}
	
	if (!(regexEmail.test(userEmail))){
		let error = $("<li></li>").text("Invalid email address."); 
		error.css("color", "red"); 
		errorBlock.append(error);
		is_it_valid = false;
	}

	if(!regexPassword.test(userPassword)){
		let error = $("<li></li>").text("Invalid password."); 
		error.css("color", "red"); 
		errorBlock.append(error);
		is_it_valid = false;
	}

	if (userPassword != confirmPassword){
		let error = $("<li></li>").text("Passwords don't match."); 
		error.css("color", "red"); 
		errorBlock.append(error);
		is_it_valid = false;
	}

	if(is_it_valid){
		var token = window.localStorage.getItem("authToken"); 
		alert("is it valid "+token); 
		$.ajax({
			url: '/login/update',
			type: 'POST', 
			headers: {'x-auth': token},
			contentType: 'application/json',
			data: JSON.stringify({email:userEmail, name:userName, password:userPassword}), 
			dataType: 'json'
		})
		.done(updateSuccess)
		.fail(updateFailure);
	
	}

	else{
		errors.css("display", "block"); 
	}
}


function updateSuccess(data, textStatus, jqXHR){
	if(data.success){
		window.localStorage.clear();
		window.localStorage.setItem("authToken",data.token);
		
		

		////////////////////////////////////////////////////////
		//need to go through and change the email attached to //
		//all of the devices to match the updated email for   //
		//the account.                                        //
		////////////////////////////////////////////////////////









		alert("update success "+ data.token); 
		window.open("account_page.html", "_self");
	}
	else{
		let errorBlock = $("#errorList");
		errorBlock.html("");   
		let errors = $("#formErrors");
		let error = $("<li></li>").text(data.message); 
		error.css("color", "red"); 
		errorBlock.append(error);
		errors.css("display", "block"); 
	}
}


function updateFailure(jqXHR, textStatus, errorThrown){
	if (jqXHR.statusCode == 404){
		let errorBlock = $("#errorList");
		errorBlock.html("");   
		let errors = $("#formErrors");
		let error = $("<li></li>").text("Server could not be reached"); 
		error.css("color", "red"); 
		errorBlock.append(error);
		errors.css("display", "block"); 
	}	

	else{
		let errorBlock = $("#errorList");
		errorBlock.html("");   
		let errors = $("#formErrors");
		let error = $("<li></li>").text("Server is currently experiencing issues."); 
		error.css("color", "red"); 
		errorBlock.append(error);
		errors.css("display", "block"); 
	}
}