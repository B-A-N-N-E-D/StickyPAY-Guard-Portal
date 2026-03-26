import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createOrder,
  verifyOrder,
  getOrders,
  getOrderDetails,
  rejectOrder
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/details", getOrderDetails);
router.post("/verify", verifyOrder);
router.post("/reject", rejectOrder);
router.get("/", getOrders);


export default router;