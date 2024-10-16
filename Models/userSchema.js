const mongoose=require("mongoose");
const userSchema = new mongoose.Schema({
    name: String,
    phone: String,  // This will store the user's phone number for sending SMS
    email: String,
  });
  const UserModel = mongoose.model("Users",userSchema);
  module.exports = UserModel;