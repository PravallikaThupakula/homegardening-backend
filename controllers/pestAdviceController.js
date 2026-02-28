import supabase from "../config/supabaseClient.js";

/* ================= FALLBACK KNOWLEDGE ================= */
const FALLBACK_KNOWLEDGE = [
  // (⚠ keep your entire FALLBACK_KNOWLEDGE array exactly as it is)
];

/* ================= FALLBACK MATCHER ================= */
function matchFallback(query) {
  const q = (query || "").toLowerCase().trim();
  if (!q)
    return FALLBACK_KNOWLEDGE.find((x) =>
      x.keywords.includes("default")
    );

  for (const entry of FALLBACK_KNOWLEDGE) {
    if (
      entry.keywords.some(
        (k) => k !== "default" && q.includes(k)
      )
    ) {
      return entry;
    }
  }

  return FALLBACK_KNOWLEDGE.find((x) =>
    x.keywords.includes("default")
  );
}

/* ================= OPENAI HELPER ================= */
async function getAdviceFromOpenAI(query) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are a plant care and pest/disease expert. Given a pest name, symptoms, or plant problem description, respond with a JSON object only (no markdown, no code block) with exactly these keys:
- "name": short title for the pest/disease/problem (string)
- "symptoms": brief description of typical symptoms (string)
- "tips": array of 3-5 short care tips (array of strings)
- "solutions": array of 3-5 practical treatment steps (array of strings)
- "medicines": array of 3-5 specific products or treatments (organic and chemical if relevant), e.g. "Neem oil (organic)", "Insecticidal soap" (array of strings)
Keep each tip, solution, and medicine concise (one line each). If the query is vague, give general plant care and pest-check advice.`;

  try {
    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content?.trim();

    if (!content) return null;

    const jsonStr = content
      .replace(/^```json?\s*|\s*```$/g, "")
      .trim();

    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("OpenAI request failed:", e.message);
    return null;
  }
}

/* ================= MAIN CONTROLLER ================= */
export const getPestAdvice = async (req, res) => {
  try {
    const { query } = req.body || {};
    const text =
      typeof query === "string" ? query.trim() : "";

    if (!text) {
      return res.status(400).json({
        error:
          "Query is required (pest name, symptoms, or plant problem).",
      });
    }

    /* 1️⃣ Try OpenAI */
    const aiResult = await getAdviceFromOpenAI(text);

    if (aiResult && aiResult.name) {
      return res.json({
        source: "openai",
        name: aiResult.name,
        symptoms: aiResult.symptoms || "",
        tips: Array.isArray(aiResult.tips)
          ? aiResult.tips
          : [],
        solutions: Array.isArray(aiResult.solutions)
          ? aiResult.solutions
          : [],
        medicines: Array.isArray(aiResult.medicines)
          ? aiResult.medicines
          : [],
      });
    }

    /* 2️⃣ Try Supabase Database */
    const q = `%${text}%`;

    const { data: dbPests = [], error: dbErr } =
      await supabase
        .from("pests")
        .select("*")
        .or(
          `name.ilike.${q},symptoms.ilike.${q},affected_plants.ilike.${q}`
        )
        .limit(3);

    if (dbErr) throw dbErr;

    if (dbPests.length > 0) {
      const p = dbPests[0];

      return res.json({
        source: "database",
        name: p.name,
        symptoms: p.symptoms || "",
        tips: p.prevention
          ? p.prevention
              .split(/[.;]\s*/)
              .filter(Boolean)
              .slice(0, 5)
          : [],
        solutions: p.treatment
          ? p.treatment
              .split(/[.;]\s*/)
              .filter(Boolean)
              .slice(0, 5)
          : [],
        medicines: [
          "See treatment steps above; use organic options first (neem oil, soap, copper).",
        ],
      });
    }

    /* 3️⃣ Fallback Knowledge */
    const fallback = matchFallback(text);

    return res.json({
      source: "fallback",
      name: fallback.name,
      symptoms: fallback.symptoms,
      tips: fallback.tips,
      solutions: fallback.solutions,
      medicines: fallback.medicines,
    });
  } catch (error) {
    console.error("Pest advice error:", error);
    res.status(500).json({
      error: "Failed to get pest advice.",
    });
  }
};