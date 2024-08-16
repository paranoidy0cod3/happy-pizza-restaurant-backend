import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  verifyOtp,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/reset-password").post(resetPassword);
router.route("/verify-otp").post(verifyOtp);

export default router;
