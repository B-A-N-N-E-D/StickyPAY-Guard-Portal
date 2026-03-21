import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Guard Portal Backend Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});