const supabase = require("../config/supabaseClient");
const { addXP } = require("../utils/xpHelpers");

// Get all challenges
exports.getAllChallenges = async (req, res) => {
  try {
    const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('challenges').select('*').eq('id', id).limit(1);
    if (error) throw error;
    const item = data && data[0];
    if (!item) return res.status(404).json({ error: "Challenge not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;

    const { data: existing = [], error: existsErr } = await supabase
      .from('userchallenges')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .limit(1);
    if (existsErr) throw existsErr;
    if (existing && existing.length) return res.status(400).json({ error: 'Already joined this challenge' });

    const { data, error } = await supabase.from('userchallenges').insert([
      { user_id: userId, challenge_id: challengeId, status: 'in_progress', progress: 0 }
    ]);
    if (error) throw error;
    res.status(201).json(data && data[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update challenge progress
exports.updateChallengeProgress = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;
    const { progress, status } = req.body;

    const { data, error } = await supabase
      .from('userchallenges')
      .update({ progress, status })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .select('*');
    if (error) throw error;
    const updated = data && data[0];
    if (!updated) return res.status(400).json({ error: 'Unable to update' });

    // If completed, award XP (same as dashboard points)
    if (status === 'completed') {
      const { data: challenges = [], error: cErr } = await supabase.from('challenges').select('points').eq('id', challengeId).limit(1);
      if (!cErr && challenges && challenges[0]) {
        await addXP(supabase, userId, challenges[0].points || 0);
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Share to social — award +10 XP (post)
exports.shareProgress = async (req, res) => {
  try {
    await addXP(supabase, req.user.id, 10);
    res.json({ message: "+10 XP for sharing!", xp: 10 });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get leaderboard (xp + streak for display)
exports.getLeaderboard = async (req, res) => {
  try {
    const { data: users = [], error } = await supabase.from('users').select('id,name,email,xp,streak').order('xp', { ascending: false }).limit(100);
    if (error) throw error;
    res.json(users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      xp: u.xp,
      streak: u.streak,
      points: u.xp ?? 0,
    })));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get user's challenges
exports.getUserChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase.from('userchallenges').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    const challengeIds = (data || []).map((uc) => uc.challenge_id).filter(Boolean);
    const { data: challenges = [], error: cErr } = challengeIds.length ? await supabase.from('challenges').select('*').in('id', challengeIds) : { data: [], error: null };
    if (cErr) throw cErr;
    const challengeMap = challenges.reduce((m, c) => { m[c.id] = c; return m; }, {});
    const result = (data || []).map((uc) => ({ ...uc, challenge: challengeMap[uc.challenge_id] || null }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
