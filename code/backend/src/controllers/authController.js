import { validate, loginSchema } from "../validators/index.js";
import { login } from "../services/authService.js";

export const loginController = [
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const result = await login(req.body, { user: req.user });
      res.json({ success: true, ...result, message: "Login successful" });
    } catch (error) {
      next(error);
    }
  },
];
