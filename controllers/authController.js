// Supabase implementation of authentication
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const supabase = require("../config/supabaseClient");

// We keep a small in‑memory cache only for offline/dev mode if needed
const memoryUsers = [];

exports.register = async (req, res) => {
  const { name, email, password, location } = req.body;

  try {
    // create a new user row in Supabase
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);
    if (fetchError) throw fetchError;
    if (existingUsers && existingUsers.length) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: inserted, error: insertError } = await supabase.from('users').insert([
      {
        id: randomUUID(),
        name,
        email,
        password_hash: hashedPassword,
        location: location || null,
        xp: 0,
        streak: 0,
      },
    ]);
    if (insertError) throw insertError;
    // cache for offline/dev
    memoryUsers.push(inserted[0]);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // find the user and verify password
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);
    if (findError) throw findError;
    const user = users && users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash || ""))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // create JWT ourselves
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      streak: user.streak,
      level: user.level,
      points: user.points || user.xp || 0,
      location: user.location,
    };
    return res.json({ token: accessToken, user: safeUser });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
};

/** Return current user with fresh xp/level/streak from DB (for refreshing points after actions) */
exports.getMe = async (req, res) => {
  try {
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .limit(1);
    if (fetchError) throw fetchError;
    const user = users && users[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      last_streak_date: user.last_streak_date,
      points: user.points ?? user.xp ?? 0,
    };
    res.json({ user: safeUser });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};
