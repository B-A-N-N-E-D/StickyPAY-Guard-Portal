import { supabase } from "../config/supabase.js";

export const guardLogin = async (req, res) => {
  try {
    const { guard_id, pin } = req.body;

    if (!guard_id || !pin) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const { data, error } = await supabase
      .from("guards")
      .select("*")
      .eq("guard_id", guard_id)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid Guard ID or PIN" });
    }

    res.json({
      success: true,
      guard: data,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
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