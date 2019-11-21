var db = require("../db");

var Devices = db.model("Devices", {
	id: {type:String, required:true},
	email: {type:String, required:true}, 
	apikey: {type:String, required:true} 
});

module.exports = Devices; 