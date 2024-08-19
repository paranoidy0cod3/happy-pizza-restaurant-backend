import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Cart } from "../models/cart.model.js";

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
  console.log(typeof userId);
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
  console.log("item id", existingItem);
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
export { getCart, addToCart, incrementCartItem };
