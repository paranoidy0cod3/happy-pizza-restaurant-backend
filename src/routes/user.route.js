import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getCurrentUser,
  verifyOtp,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/reset-password").post(resetPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/verify-otp").post(verifyOtp);

export default router;
