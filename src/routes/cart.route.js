import { Router } from "express";
import {
  addToCart,
  clearCart,
  decrementCartItem,
  getCart,
  handleCheckout,
  incrementCartItem,
  removeCartItem,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get-cart/:userId").get(getCart);
router.route("/add-to-cart/:userId").post(verifyJWT, addToCart);
router.route("/increment-quantity/:itemId").put(incrementCartItem);
router.route("/decrement-quantity/:itemId").put(decrementCartItem);
router.route("/remove-from-cart/:itemId").delete(removeCartItem);
router.route("/checkout").get(verifyJWT, handleCheckout);
router.route("/clear-cart").get(verifyJWT, clearCart);

export default router;
