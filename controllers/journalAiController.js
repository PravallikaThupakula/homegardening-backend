async function callOpenAI(systemPrompt, userContent, maxTokens = 200) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.6,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("Journal AI error:", e.message);
    return null;
  }
}

/** POST /api/journal/ai/reflection  { "notes": "Today my rose has small buds forming." } */
exports.getReflection = async (req, res) => {
  try {
    const { notes } = req.body || {};
    const text = (typeof notes === "string" ? notes : "").trim();
    if (!text) return res.status(400).json({ error: "notes is required" });

    const systemPrompt = `You are a supportive gardening coach. The user wrote a short gardening journal entry. Respond with encouraging feedback in exactly 2 short sentences. Mention their progress positively. No markdown.`;
    const reflection = await callOpenAI(systemPrompt, `Journal entry: "${text}"`);
    if (!reflection) return res.json({ reflection: "Keep nurturing your plants! Your consistency is paying off." });
    res.json({ reflection });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

/** POST /api/journal/ai/mood  { "notes": "Leaves are drooping and I am worried." } */
exports.detectMood = async (req, res) => {
  try {
    const { notes } = req.body || {};
    const text = (typeof notes === "string" ? notes : "").trim();
    if (!text) return res.status(400).json({ error: "notes is required" });

    const systemPrompt = `Analyze the emotional tone of this gardening journal entry. Reply with ONLY one word: happy, neutral, worried, hopeful, or proud. Nothing else.`;
    const raw = await callOpenAI(systemPrompt, text, 20);
    const mood = (raw || "neutral").toLowerCase().trim();
    const allowed = ["happy", "neutral", "worried", "hopeful", "proud"];
    const normalized = allowed.includes(mood) ? mood : "neutral";
    res.json({ mood: normalized });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};
