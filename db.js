var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/db19", { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = mongoose;
