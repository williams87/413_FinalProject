var db = require("../db");

var Recording = db.model("Recording", {
	zip: {type: Number},
	airQuality: {type: Number}
});
module.exports = Recording;