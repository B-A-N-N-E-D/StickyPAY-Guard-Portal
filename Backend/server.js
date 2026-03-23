import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import guardRoutes from "./routes/guardRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://stickypay-guard-portal.vercel.app",
    // add more frontend URLs here
  ],
  credentials: true,
}));

app.use(express.json());

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