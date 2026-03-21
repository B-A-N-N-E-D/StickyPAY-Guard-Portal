import express from "express";
import { guardLogin, guardLogout } from "../controllers/guardController.js";

const router = express.Router();

router.post("/login", guardLogin);   // ✅ THIS WAS MISSING
router.post("/logout", guardLogout);

export default router;