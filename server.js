import express from "express";
import cors from "cors";
import supabase from "./config/supabaseClient.js";

import authRoutes from "./routes/authRoutes.js";
import gardenRoutes from "./routes/gardenRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import plantRoutes from "./routes/plantRoutes.js";
import pestRoutes from "./routes/pestRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import seasonalTipsRoutes from "./routes/seasonalTipsRoutes.js";
import shoppingListRoutes from "./routes/shoppingListRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/garden", gardenRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/pests", pestRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/seasonal-tips", seasonalTipsRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/ai", aiRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("🌱 Home Gardening Backend Running...");
});

// Supabase test
app.get("/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route test
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err?.stack || err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err?.message || "Server error" });
});

// Start server only in development
if (process.env.NODE_ENV !== "production") {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🌱 Server running on port ${PORT}`);
  });
}
console.log("Loaded URL:", process.env.SUPABASE_URL);
console.log("Loaded KEY:", process.env.SUPABASE_KEY ? "Key exists" : "No key");
export default app;