const express = require("express");
const router = express.Router();
const supabase = require('../config/supabaseClient');
const authMiddleware = require("../middleware/authMiddleware");
const { getLevel, getProgress, XP_PER_LEVEL } = require("../utils/xpHelpers");
// (requires moved above)

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  const today = new Date();
  try {
    const { data: plants = [], error: pErr } = await supabase.from('gardenitems').select('*').eq('user_id', userId);
    if (pErr) throw pErr;

    const totalPlants = (plants || []).length;
    const plantsToWaterToday = (plants || []).filter((plant) => {
      if (!plant.last_watered) return true;
      const wateredDate = new Date(plant.last_watered);
      const diffDays = Math.floor((today - wateredDate) / (1000 * 60 * 60 * 24));
      return diffDays >= (plant.watering_frequency || 0);
    });

    const { data: users = [], error: uErr } = await supabase.from('users').select('xp,streak,level').eq('id', userId).limit(1);
    if (uErr) throw uErr;
    const user = users && users[0];
    const xp = user?.xp ?? 0;
    const level = getLevel(xp);
    const progress = getProgress(xp);

    let wateringWeekly = [];
    try {
      const start = new Date(today);
      start.setDate(start.getDate() - 28);
      const { data: logs = [], error: lErr } = await supabase.from('watering_logs').select('watered_at').gte('watered_at', start.toISOString()).eq('user_id', userId);
      if (lErr) throw lErr;

      const weekLabels = ["4 wks ago", "3 wks ago", "2 wks ago", "This week"];
      const counts = [0, 0, 0, 0];
      (logs || []).forEach((log) => {
        const d = new Date(log.watered_at);
        const daysAgo = (today - d) / (24 * 60 * 60 * 1000);
        if (daysAgo <= 7) counts[3]++;
        else if (daysAgo <= 14) counts[2]++;
        else if (daysAgo <= 21) counts[1]++;
        else if (daysAgo <= 28) counts[0]++;
      });
      wateringWeekly = weekLabels.map((week, i) => ({ week, waterings: counts[i] }));
    } catch (_) {
      wateringWeekly = [
        { week: "4 wks ago", waterings: 0 },
        { week: "3 wks ago", waterings: 0 },
        { week: "2 wks ago", waterings: 0 },
        { week: "This week", waterings: 0 },
      ];
    }

    res.json({
      totalPlants,
      needsWater: plantsToWaterToday.length,
      plantsToWaterToday,
      xp,
      streak: user?.streak ?? 0,
      level,
      progress,
      xpPerLevel: XP_PER_LEVEL,
      wateringWeekly,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
