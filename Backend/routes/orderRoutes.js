import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createOrder,
  verifyOrder,
  getOrders
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyOrder);
router.get("/", getOrders);
router.post("/verify", protect, verifyOrder);

export default router;