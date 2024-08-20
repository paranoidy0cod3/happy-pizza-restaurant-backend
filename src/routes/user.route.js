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
router.route("/reset-password").put(resetPassword);
router.route("/verify-otp").put(verifyOtp);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
