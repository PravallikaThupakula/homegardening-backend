const XP_PER_LEVEL = 200;

/* ================= LEVEL CALCULATION ================= */
export const getLevel = (xp) => {
  return Math.floor((xp || 0) / XP_PER_LEVEL);
};

export const getProgress = (xp) => {
  return (xp || 0) % XP_PER_LEVEL;
};

/* ================= ADD XP ================= */
export const addXP = async (supabase, userId, amount) => {
  const { data: user, error: fetchErr } = await supabase
    .from("users")
    .select("xp")
    .eq("id", userId)
    .single();

  if (fetchErr || !user) {
    console.error(
      "[addXP] Could not read user xp:",
      fetchErr?.message || "No user"
    );
    return null;
  }

  const newXP = (user.xp || 0) + amount;
  const level = getLevel(newXP);

  const { error: updateErr } = await supabase
    .from("users")
    .update({ xp: newXP, level })
    .eq("id", userId);

  if (updateErr) {
    console.error(
      "[addXP] Could not update user xp:",
      updateErr.message
    );
    return null;
  }

  return newXP;
};

/* ================= UPDATE STREAK ================= */
export const updateStreak = async (supabase, userId) => {
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data: users, error: fetchErr } =
      await supabase
        .from("users")
        .select("streak,last_streak_date")
        .eq("id", userId)
        .limit(1);

    if (fetchErr) {
      console.error(
        "[updateStreak] fetch error",
        fetchErr.message
      );
      return;
    }

    const user = users && users[0];
    if (!user) return;

    const last = user.last_streak_date
      ? new Date(user.last_streak_date)
          .toISOString()
          .split("T")[0]
      : null;

    const yesterday = new Date(
      Date.now() - 864e5
    )
      .toISOString()
      .split("T")[0];

    let newStreak = 1;

    if (last === yesterday) {
      newStreak = (user.streak || 0) + 1;
    } else if (last === today) {
      return; // already updated today
    }

    const { error: updateErr } = await supabase
      .from("users")
      .update({
        streak: newStreak,
        last_streak_date:
          new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateErr)
      console.error(
        "[updateStreak] update error",
        updateErr.message
      );
  } catch (e) {
    console.error(
      "[updateStreak] unexpected error",
      e.message || e
    );
  }
};

/* ================= EXPORT CONSTANT ================= */
export { XP_PER_LEVEL };