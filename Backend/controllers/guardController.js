import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

export const guardLogin = async (req, res) => {
  try {
    const { guard_id, pin } = req.body;

    const { data, error } = await supabase
      .from("guards")
      .select("*")
      .eq("guard_id", guard_id)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔥 CREATE TOKEN
    const token = jwt.sign(
      { guard_id: data.guard_id, id: data.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      guard: data
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const guardLogout = async (req, res) => {
  try {
    const { guard_id } = req.body;

    await supabase
      .from("guards")
      .update({
        is_active: false,
        shift_end: new Date().toISOString(),
      })
      .eq("guard_id", guard_id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};