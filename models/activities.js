var db = require("../db");

var Activities = db.model("Activities", {
	deviceId: {type: String, required: true},
	longitude:[Number], 
	latitude:[Number],
	uv: [Number],
	date: String,
	unix: Number,   
	speed:[Number], 
	temp: Number, 
	humidity: Number,
	calories: Number, 
	type: String,
	duration: Number
});
module.exports = Activities;