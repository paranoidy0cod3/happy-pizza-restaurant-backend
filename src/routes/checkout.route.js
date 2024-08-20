import { Router } from "express";

const router = Router();

router.route("/checkout").post(handleCheckout);

export default router;
