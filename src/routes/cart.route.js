import { Router } from "express";
import {
  addToCart,
  getCart,
  incrementCartItem,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get-cart/:userId").get(getCart);
router.route("/add-to-cart/:userId").post(verifyJWT, addToCart);
router.route("/increment-quantity/:itemId").put(incrementCartItem);

export default router;
