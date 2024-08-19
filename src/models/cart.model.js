import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
  {
    id: Number,
    name: String,
    price: Number,
    totalPrice: Number,
    quantity: Number,
    rating: Number,
    image: String,
    userId: String,
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
