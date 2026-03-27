import { supabase } from "../config/supabase.js";

// Helper: find order by qr_code OR transaction_id
async function findOrder(code) {
  // 1. Try qr_code
  const { data: qrData } = await supabase
    .from("orders")
    .select("*")
    .eq("qr_code", code)
    .maybeSingle();

  if (qrData) return qrData;

  // 2. Try transaction_id
  const { data: txnData } = await supabase
    .from("orders")
    .select("*")
    .eq("transaction_id", code)
    .maybeSingle();

  return txnData || null;
}

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

// Called when guard scans QR — fetch order details without verifying
export const getOrderDetails = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "QR code missing" });

    const order = await findOrder(code.trim());

    if (!order) {
      return res.status(404).json({ error: "Invalid QR — order not found" });
    }

    if (order.verified) {
      // Already used — return data so frontend shows "Already Verified" card
      return res.json({ alreadyVerified: true, order });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("getOrderDetails error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Called when guard presses Verify — sets verified=true in DB
export const verifyOrder = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "QR code missing" });

    const order = await findOrder(code.trim());

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.verified) {
      return res.status(400).json({ error: "Already verified" });
    }

    // Update verified = true (and verified_at timestamp)
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("order_id", order.order_id);

    if (updateError) {
      console.error("verifyOrder update error:", JSON.stringify(updateError));
      return res.status(500).json({ error: "Update failed: " + updateError.message });
    }

    // Return the updated order object to the frontend
    const updatedOrder = { ...order, verified: true, verified_at: new Date().toISOString() };

    res.json({
      success: true,
      message: "Entry Allowed ✅",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("verifyOrder error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Called when guard presses Reject
export const rejectOrder = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "QR code missing" });

    const order = await findOrder(code.trim());
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { error: updateError } = await supabase
      .from("orders")
      .update({ verified: false })
      .eq("order_id", order.order_id);

    if (updateError) {
      console.error("rejectOrder update error:", JSON.stringify(updateError));
      return res.status(500).json({ error: "Reject failed: " + updateError.message });
    }

    res.json({ success: true, message: "Order Rejected ❌" });
  } catch (err) {
    console.error("rejectOrder error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};