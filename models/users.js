var db = require("../db");

var Users = db.model("Users", {
	email: {type:String, required:true, unique:true}, 
	name: {type:String, required:true},
	password: {type:String, required:true},
	uv: Number 
});

module.exports = Users; 