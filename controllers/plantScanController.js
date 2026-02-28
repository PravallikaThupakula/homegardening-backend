// Analyze plant image via OpenAI Vision and return health status

const HEALTH_LABELS = [
  "Healthy",
  "Thriving",
  "Flourishing",
  "Vibrant",
  "Lush",
  "Active Growth",
  "Well-Watered",
  "Nutrient Balanced",
  "Pest-Free",
  "Disease-Free",
];

const GOOD_STATUSES = new Set(HEALTH_LABELS);

/**
 * @param {string} imageUrl - Public URL of the plant image (e.g. from Supabase storage)
 * @returns {Promise<{ status: string, isGood: boolean }>}
 */
async function scanPlantImage(imageUrl) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // No API key: return a random good status for demo
    const status = HEALTH_LABELS[Math.floor(Math.random() * HEALTH_LABELS.length)];
    return { status, isGood: true };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 50,
        messages: [
          {
            role: "system",
            content: `You are a plant health expert. Look at the plant image and reply with ONLY one phrase from this exact list (no other text): ${HEALTH_LABELS.join(", ")}, or if the plant looks unhealthy, stressed, or you cannot tell: Needs Care.`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI Vision error:", res.status, err);
      return { status: "Needs Care", isGood: false };
    }

    const data = await res.json();
    const raw = (data.choices?.[0]?.message?.content || "").trim();
    const normalized = raw.replace(/^["']|["']$/g, "").trim();
    const status = HEALTH_LABELS.find((l) => normalized.toLowerCase().includes(l.toLowerCase())) || "Needs Care";
    const isGood = GOOD_STATUSES.has(status);
    return { status, isGood };
  } catch (e) {
    console.error("Plant scan error:", e.message);
    return { status: "Needs Care", isGood: false };
  }
}

module.exports = { scanPlantImage, HEALTH_LABELS, GOOD_STATUSES };
