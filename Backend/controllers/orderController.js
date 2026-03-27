import { supabase } from "../config/supabase.js";

export const createOrder = async (req, res) => {
  try {
    const { user_id, store_id, store_name, total_amount, payment_method, qr_code, transaction_id } = req.body;

    const { data, error } = await supabase
      .from("orders")
      .insert([{ user_id, store_id, store_name, total_amount, payment_method, qr_code, transaction_id }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Called when guard scans a QR — supports both qr_code and transaction_id fields
export const getOrderDetails = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: "QR code missing" });

    // Try matching qr_code first, then transaction_id
    let { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("qr_code", code)
      .maybeSingle();

    if (!data) {
      const result = await supabase
        .from("orders")
        .select("*")
        .eq("transaction_id", code)
        .maybeSingle();
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return res.status(404).json({ error: "Invalid QR — order not found" });
    }

    if (data.verified) {
      // Already used — return data so frontend can show the "Already Verified" card
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

    if (!code) return res.status(400).json({ error: "QR code missing" });

    // Find order by qr_code or transaction_id
    let { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("qr_code", code)
      .maybeSingle();

    if (!data) {
      const result = await supabase
        .from("orders")
        .select("*")
        .eq("transaction_id", code)
        .maybeSingle();
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (data.verified) {
      return res.status(400).json({ error: "Already verified" });
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        verified: true,
        payment_status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("order_id", data.order_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Update failed: " + updateError.message });
    }

    res.json({
      success: true,
      message: "Entry Allowed ✅",
      order: { ...data, verified: true, payment_status: "verified", verified_at: new Date().toISOString() }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: "QR code missing" });

    // Find by qr_code or transaction_id
    let { data } = await supabase
      .from("orders")
      .select("order_id")
      .eq("qr_code", code)
      .maybeSingle();

    if (!data) {
      const result = await supabase
        .from("orders")
        .select("order_id")
        .eq("transaction_id", code)
        .maybeSingle();
      data = result.data;
    }

    if (!data) return res.status(404).json({ error: "Order not found" });

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_status: "cancelled", verified: false })
      .eq("order_id", data.order_id);

    if (updateError) return res.status(500).json({ error: "Reject failed" });

    res.json({ success: true, message: "Order Rejected ❌" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};