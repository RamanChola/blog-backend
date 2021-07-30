const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    
  },
  lastname: {
    type: String,
    required: true,

  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  blogs: [{ type: mongoose.Types.ObjectId, required: true, ref: "Post" }],
});
module.exports = mongoose.model("User",userSchema);

