import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import nodemailer from "nodemailer";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      " something went wrong while generating access/refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const username = name.split(" ")[0];

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "user with email/username already exists!");
  }

  const user = await User.create({
    fullName: name,
    username,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user Registered Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required!");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(401, "user does not exists!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select("-password");
  const options = {
    httpOnly: true, // Cookie is only accessible by the web server
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production (requires HTTPS)
    sameSite: "None", // Adjust as needed: 'Lax', 'Strict', or 'None'
    // 1 day expiration (adjust as needed)
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, //this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out!"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const generateOTP = Math.floor(Math.random() * 10000);
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "email is not registered!");
  }

  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.OTP_SENDER_EMAIL,
    to: email,
    subject: "your new OTP is here",
    html: `<h4> Your Generated OTP is: <b>${generateOTP}</b> </h4>`,
  });

  if (!info.messageId) {
    throw new ApiError(500, "something went wrong while sending new OTP!");
  }

  const otpUser = await User.findOneAndUpdate(
    { email },
    { $set: { otp: generateOTP } }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Reset password link has been sent, check your Email!"
      )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  if (!otp && !newPassword) {
    throw new ApiError(401, "new password/otp is reqired!");
  }

  const securePassword = await bcrypt.hash(newPassword, 10);

  const user = await User.findOneAndUpdate(
    { otp },
    { $set: { password: securePassword, otp: 0 } },
    {}
  ).select("-password -refreshToken -otp");

  if (!user) {
    throw new ApiError(400, "Invalid OTP!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "reset new password successfully!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getCurrentUser,
  verifyOtp,
};
