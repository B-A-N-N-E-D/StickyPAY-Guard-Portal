import { supabase } from "../config/supabase.js";

export const createOrder = async (req, res) => {
  try {
    const { customer_name, total_amount } = req.body;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name,
          total_amount
        }
      ])
      .select();

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
};

export const getOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyOrder = async (req, res) => {
  try {
    const { code } = req.body;

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("qr_code", code)
      .single();

    if (!data) {
      return res.json({ error: "Invalid QR" });
    }

    if (data.verified) {
      return res.json({ error: "Already used" });
    }

    await supabase
      .from("orders")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        verified_by: req.guard.id // 🔥 TRACK GUARD
      })
      .eq("order_id", data.order_id);

    res.json({ success: true, order: data });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const guardLogin = async (req, res) => {
  const { guard_id, pin } = req.body;

  const { data, error } = await supabase
    .from("guards")
    .select("*")
    .eq("guard_id", guard_id)
    .eq("pin", pin)
    .single();

  if (error || !data) {
    return res.json({ error: "Invalid credentials" });
  }

  res.json({ success: true, guard: data });
};

export const guardLogout = async (req, res) => {
  const { guard_id } = req.body;

  await supabase
    .from("guards")
    .update({
      is_active: false,
      shift_end: new Date().toISOString(),
    })
    .eq("guard_id", guard_id);

  res.json({ success: true });
};