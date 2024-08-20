import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Cart } from "../models/cart.model.js";
import Stripe from "stripe";
import { User } from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_KEY);

const getCart = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const existingCart = await Cart.find({ userId });
  if (!existingCart) {
    throw new ApiError(400, "cart not found!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, existingCart, "fetched cart items successfully!")
    );
});

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const { id, image, name, price, rating, quantity } = req.body;

  const existingItem = await Cart.findOne({ id, userId });

  if (!existingItem) {
    const newCart = await Cart.create({
      id,
      name,
      price,
      rating,
      image,
      quantity,
      userId,
      totalPrice: price * quantity,
    });
  }

  const createdCart = await Cart.findOne({ id, userId });
  if (!createdCart) {
    throw new ApiError(500, "something went wront while adding to Cart!");
  }

  if (existingItem) {
    const updateItem = await Cart.findOneAndUpdate(
      { id, userId },
      {
        $set: {
          quantity: existingItem.quantity + 1,
          totalPrice: existingItem.price * (existingItem.quantity + 1),
        },
      },
      { upsert: true, new: true }
    );

    return res
      .status(201)
      .json(
        new ApiResponse(200, updateItem, "item updated to cart successfully!")
      );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdCart, "item added to cart successfully!")
    );
});

const incrementCartItem = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId;
  const existingItem = await Cart.findOne({ _id: itemId });

  if (!existingItem) {
    throw new ApiError(400, "item not found!");
  }
  const updatedItem = await Cart.findOneAndUpdate(
    { _id: itemId },
    { $set: { quantity: existingItem.quantity + 1 } },
    { upsert: true, new: true }
  );

  if (!updatedItem) {
    throw new ApiError(
      500,
      "something went wrong while incrementing item quantity!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedItem,
        "item quanity incremented successfully!"
      )
    );
});

const decrementCartItem = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId;
  const existingItem = await Cart.findOne({ _id: itemId });

  if (!existingItem) {
    throw new ApiError(400, "item not found!");
  }
  const updatedItem = await Cart.findOneAndUpdate(
    { _id: itemId },
    { $set: { quantity: existingItem.quantity - 1 } },
    { upsert: true, new: true }
  );

  if (!updatedItem) {
    throw new ApiError(
      500,
      "something went wrong while incrementing item quantity!"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedItem,
        "item quanity incremented successfully!"
      )
    );
});

const removeCartItem = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId;

  const removedItem = await Cart.findOneAndDelete({ _id: itemId });

  if (!removedItem) {
    throw new ApiError(
      500,
      "something went wrong while removing item from the cart"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, removedItem, "item removed successfully!"));
});

const handleCheckout = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cartItems = await Cart.find({ userId });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: cartItems.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: item.price * 100,
        },

        quantity: item.quantity,
      };
    }),
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
  });

  if (!session.url) {
    throw new ApiError(500, "something went wrong while processing payment!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, session.url, "payment session started!"));
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const deletedItems = await Cart.deleteMany({ userId });
  const deletedList = await User.findOneAndUpdate(
    { _id: userId },
    { cartItems: [] }
  );

  if (!deletedItems && !deletedList) {
    throw new ApiError(400, "failed to clear Cart!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "clear cart Successfully!"));
});

export {
  getCart,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  handleCheckout,
  clearCart,
};
