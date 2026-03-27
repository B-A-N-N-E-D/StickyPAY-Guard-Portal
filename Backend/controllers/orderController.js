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

export const getOrderDetails = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "QR code missing" });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("transaction_id", code)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Invalid QR ❌" });
    }

    if (data.verified) {
      // Return order data so frontend can show the "Already Verified" card, not INVALID screen
      return res.json({ alreadyVerified: true, order: data });
    }

    res.json({ success: true, order: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyOrder = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "QR code missing" });
    }

    // ✅ FIX: Use transaction_id instead of qr_code
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("transaction_id", code)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Invalid QR ❌" });
    }

    if (data.verified) {
      return res.status(400).json({
        error: "Already used ⚠️",
        verified_date: data.verified_date,
        order: data
      });
    }

    // ✅ SAFE UPDATE
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        verified: true,
        status: "verified",
        verified_date: new Date().toISOString(),
      })
      .eq("transaction_id", code);

    if (updateError) {
      return res.status(500).json({ error: "Update failed" });
    }

    res.json({
      success: true,
      message: "Entry Allowed ✅",
      order: { ...data, verified: true }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "QR code missing" });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        verified: false,
      })
      .eq("transaction_id", code);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: "Reject failed" });
    }

    res.json({
      success: true,
      message: "Order Rejected ❌"
    });

  } catch (err) {
    console.error(err);
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