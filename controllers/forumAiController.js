
async function callOpenAI(systemPrompt, userContent, maxTokens = 400) {
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
        temperature: 0.5,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("Forum AI error:", e.message);
    return null;
  }
}

/** POST /api/forum/ai/suggest-answer  { "question": "Why are my tomato leaves yellow?" } */
exports.suggestAnswer = async (req, res) => {
  try {
    const { question } = req.body || {};
    const text = (typeof question === "string" ? question : "").trim();
    if (!text) return res.status(400).json({ error: "question is required" });

    const systemPrompt = `You are a gardening expert. The user asked a gardening question. Give a beginner-friendly explanation with up to 3 possible causes and solutions. Keep the reply concise (2-4 short paragraphs). No markdown.`;
    const content = await callOpenAI(systemPrompt, `User asked: "${text}"`);
    if (!content) return res.json({ suggestion: "AI suggestion is unavailable. Add OPENAI_API_KEY for smart answers." });
    res.json({ suggestion: content });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

/** POST /api/forum/ai/suggest-tags  { "content": "Why are my tomato leaves yellow and curling?" } */
exports.suggestTags = async (req, res) => {
  try {
    const { content } = req.body || {};
    const text = (typeof content === "string" ? content : "").trim();
    if (!text) return res.status(400).json({ error: "content is required" });

    const systemPrompt = `Extract exactly 3 short gardening tags from this text. Return ONLY a JSON array of 3 strings, e.g. ["Tomato","LeafProblem","Watering"]. No other text.`;
    const raw = await callOpenAI(systemPrompt, text, 100);
    if (!raw) return res.json({ tags: [] });
    const jsonStr = raw.replace(/^```json?\s*|\s*```$/g, "").trim();
    let tags = [];
    try {
      tags = JSON.parse(jsonStr);
      if (!Array.isArray(tags)) tags = [];
      tags = tags.slice(0, 3).map((t) => String(t).trim()).filter(Boolean);
    } catch (_) {
      tags = [];
    }
    res.json({ tags });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};
