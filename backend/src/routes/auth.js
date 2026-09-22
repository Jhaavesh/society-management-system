import { Router } from "express";
import { loginController } from "../controllers/index.js";
import { validate, loginSchema } from "../validators/index.js";

const router = Router();
router.post("/login", validate(loginSchema), loginController);
export default router;
