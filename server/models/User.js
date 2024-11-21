import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'chef'], required: true }, 
});

const User = mongoose.model('User', UserSchema);

// Use ES module export
export default User;
