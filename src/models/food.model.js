import mongoose, { Schema } from "mongoose";

const foodSchema = new Schema(
  {
    id: Number,
    name: String,
    price: Number,
    totalPrice: Number,
    qty: Number,
    rating: Number,
    image: String,
    userId: String,
  },
  { timestamps: true }
);

export const Food = mongoose.model("Food", foodSchema);
