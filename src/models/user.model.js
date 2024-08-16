import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is reqired!!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required!!"],
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    cartItems: {
      type: Array,
      default: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "food",
        },
      ],
    },
    otp: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.generateNewHashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model("User", userSchema);
