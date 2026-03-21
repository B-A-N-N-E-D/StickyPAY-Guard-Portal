import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // simple hardcoded guard login (for now)
    if (username !== "guard" || password !== "1234") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: "guard" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json(err);
  }
};