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
    const { code } = req.body; // scanned QR or txn id

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`qr_code.eq.${code},transaction_id.eq.${code}`)
      .single();

    if (error || !data) {
      return res.json({ error: "Invalid QR / Transaction ID" });
    }

    if (data.verified) {
      return res.json({ alreadyVerified: true, order: data });
    }

    // ✅ Update as verified
    const { error: updateError } = await supabase
      .from("orders")
      .update({ verified: true })
      .eq("id", data.id);

    if (updateError) {
      return res.status(500).json(updateError);
    }

    return res.json({ order: data });

  } catch (err) {
    res.status(500).json(err);
  }
};