import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createOrder,
  verifyOrder,
  getOrders
} from "../controllers/orderController.js";

const router = express.Router();

// ✅ Create order
router.post("/create", createOrder);

// ✅ Verify order (PROTECTED)
router.post("/verify", protect, verifyOrder);

// ✅ Get all orders
router.get("/", getOrders);

export default router;