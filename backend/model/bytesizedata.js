const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email: { type: String, required: true ,unique: true },
    password: { type: String, required: true },
    savedArticles: [
        {
            title: String,
            url: String,
            description: String
        }
    ]
});
const User = mongoose.model("ByteSizedata", userSchema);

module.exports = User;