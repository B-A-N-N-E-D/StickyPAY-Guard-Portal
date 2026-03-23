import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import guardRoutes from "./routes/guardRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:5173",
      "https://sticky-pay-guard-portal.vercel.app",
    ];
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/guard", guardRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({ status: "StickyPAY Guard Portal API running ✅" });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});