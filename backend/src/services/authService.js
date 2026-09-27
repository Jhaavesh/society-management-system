import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { AuthenticationError, ValidationError } from "../errors/index.js";

export async function login(data, context) {
  const { email, password } = data;
  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim(), active: true }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AuthenticationError("Email or password is incorrect");
  }

  const payload = {
    sub: user._id.toString(),
    name: user.name,
    role: user.role,
    flatId: user.flatId?.toString() || null,
    societyIds: user.societyIds.map(String),
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      flatId: user.flatId,
      societyIds: user.societyIds,
    },
  };
}
