import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const verifySecretKey = async (req, res, next) => {
  const { userId, secretKey } = req.body;

  // Fetch the user by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the provided secret key matches the stored hashed secret key
  const isMatch = await bcrypt.compare(secretKey, user.parentSecretKey);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid secret key" });
  }

  next();
};

export default verifySecretKey;