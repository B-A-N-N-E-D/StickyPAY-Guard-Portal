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

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("qr_code", code) // 🔥 MATCH QR CODE
      .single();

    if (error || !data) {
      return res.json({ error: "Invalid QR Code" });
    }

    if (data.verified) {
      return res.json({ error: "Already used" });
    }

    // ✅ Mark as verified
    await supabase
      .from("orders")
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq("order_id", data.order_id);

    res.json({
      success: true,
      order: data,
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};