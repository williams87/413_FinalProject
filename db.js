var mongoose = require("mongoose");


mongoose.connect("mongodb://localhost/final", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

module.exports = mongoose;