import express from "express";
import {
  createOrder,
  verifyOrder,
  getOrders
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyOrder);
router.get("/", getOrders); // ✅ ADD THIS

export default router;