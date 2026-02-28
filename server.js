const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Supabase client
const supabase = require("./config/supabaseClient");

// Routes
const authRoutes = require("./routes/authRoutes");
const gardenRoutes = require("./routes/gardenRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const plantRoutes = require("./routes/plantRoutes");
const pestRoutes = require("./routes/pestRoutes");
const forumRoutes = require("./routes/forumRoutes");
const journalRoutes = require("./routes/journalRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const seasonalTipsRoutes = require("./routes/seasonalTipsRoutes");
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const aiRoutes = require("./routes/aiRoutes");

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

// simple mongo test
app.get("/test-db", async (req, res) => {
  try {
    const supabase = require('./config/supabaseClient');
    const { data, error } = await supabase.from('users').select('*').limit(10);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route test
const authMiddleware = require("./middleware/authMiddleware");
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌱 Server running on port ${PORT}`);
});

// Development error handler — logs error stack and returns JSON
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err && err.message ? err.message : 'Server error' });
});
