import { verifyOrder } from "../controllers/orderController.js";
import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.post("/verify", verifyOrder);
router.post("/verify", verifyOrder);

export default router;