const mongoose=require("mongoose");
const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    password: String
  });
  const UserModel = mongoose.model("Users",userSchema);
  module.exports = UserModel;