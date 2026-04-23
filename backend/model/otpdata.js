const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email: {type: String, required: true},
    otp : {type: String}
});
const Otpdb = mongoose.model("Otpdb", userSchema);
module.exports = Otpdb;