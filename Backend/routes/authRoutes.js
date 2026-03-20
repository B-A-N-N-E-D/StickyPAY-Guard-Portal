import express from "express";

const router = express.Router();

/**
 * @route   GET /api/auth/test
 * @desc    Test route
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes working ✅",
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Guard login (basic version)
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🔒 Basic validation
    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password required",
      });
    }

    // ⚡ TEMP LOGIN (replace later with DB)
    if (username === "guard" && password === "1234") {
      return res.json({
        success: true,
        guard: {
          id: "guard-1",
          name: "Security Guard",
          credits: 10,
        },
      });
    }

    return res.status(401).json({
      error: "Invalid credentials",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout route
 */
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;