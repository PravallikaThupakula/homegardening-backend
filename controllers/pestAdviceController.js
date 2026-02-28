const supabase = require('../config/supabaseClient');

// Fallback knowledge: pest/disease keywords -> tips, solutions, medicines (works without any API key)
const FALLBACK_KNOWLEDGE = [
  {
    keywords: ["aphid", "aphids", "greenfly", "blackfly"],
    name: "Aphids",
    symptoms: "Tiny insects on new growth, sticky honeydew, curled leaves.",
    tips: [
      "Spray plants with a strong jet of water to dislodge aphids.",
      "Encourage ladybugs and lacewings; they eat aphids.",
      "Avoid over-fertilizing with nitrogen; it encourages soft growth aphids love.",
    ],
    solutions: [
      "Neem oil spray: Mix 1–2 tsp neem oil with 1 L water and a drop of soap. Spray every 7–10 days.",
      "Soap spray: 1 tsp mild liquid soap in 1 L water. Spray early morning or evening.",
      "Remove heavily infested shoots and dispose of them away from the garden.",
    ],
    medicines: [
      "Neem oil (organic).",
      "Insecticidal soap (organic).",
      "Pyrethrin-based spray (organic, use as last resort).",
    ],
  },
  {
    keywords: ["spider mite", "mite", "webbing", "stippling"],
    name: "Spider Mites",
    symptoms: "Fine webbing on leaves, yellow stippling, leaves may drop.",
    tips: [
      "Increase humidity; mites thrive in dry air. Mist leaves or use a humidifier.",
      "Isolate affected plants to prevent spread.",
      "Keep plants well watered; stress invites mites.",
    ],
    solutions: [
      "Spray leaves (especially undersides) with water regularly.",
      "Neem oil or horticultural oil applied every 5–7 days.",
      "Wipe leaves with a damp cloth to remove mites and eggs.",
    ],
    medicines: [
      "Horticultural oil / neem oil (organic).",
      "Miticide containing sulfur or potassium salts of fatty acids.",
    ],
  },
  {
    keywords: ["mealybug", "mealybugs", "white cotton", "white fluff"],
    name: "Mealybugs",
    symptoms: "White cotton-like masses in leaf axils, stems, or undersides.",
    tips: [
      "Check new plants before bringing them indoors.",
      "Remove visible mealybugs with a cotton swab dipped in rubbing alcohol.",
      "Improve air circulation around plants.",
    ],
    solutions: [
      "Dab individuals with 70% isopropyl alcohol on a cotton bud.",
      "Spray with neem oil or insecticidal soap, targeting crevices.",
      "For severe cases, systemic insecticide (use according to label).",
    ],
    medicines: [
      "Neem oil, insecticidal soap (organic).",
      "Imidacloprid or acetamiprid systemic (chemical, follow label).",
    ],
  },
  {
    keywords: ["scale", "scales", "brown bumps", "brown spots on stem"],
    name: "Scale Insects",
    symptoms: "Brown or tan bumps on stems and leaves that don’t wipe off easily.",
    tips: [
      "Scrape off scales with a soft brush or fingernail where possible.",
      "Prune heavily infested branches.",
      "Apply horticultural oil in dormant season on outdoor plants.",
    ],
    solutions: [
      "Horticultural oil spray (dormant or summer rate per label).",
      "Neem oil repeated every 7–10 days.",
      "Systemic insecticide for persistent infestations.",
    ],
    medicines: [
      "Horticultural oil, neem oil (organic).",
      "Systemic insecticide containing imidacloprid (chemical).",
    ],
  },
  {
    keywords: ["fungus", "fungal", "mildew", "powdery mildew", "white powder"],
    name: "Powdery Mildew",
    symptoms: "White or gray powdery coating on leaves, stems, or flowers.",
    tips: [
      "Water at the base; avoid wetting foliage. Ensure good air circulation.",
      "Remove and destroy severely affected leaves.",
      "Choose resistant varieties when possible.",
    ],
    solutions: [
      "Spray with 1 tsp baking soda + 1 L water + drop of soap (preventive).",
      "Milk spray (1 part milk to 2–3 parts water) can reduce mildew.",
      "Sulfur or potassium bicarbonate fungicide (organic options available).",
    ],
    medicines: [
      "Sulfur-based fungicide (organic).",
      "Potassium bicarbonate (organic).",
      "Neem oil has some fungicidal effect.",
    ],
  },
  {
    keywords: ["root rot", "rot", "wilting", "yellow leaves", "overwater"],
    name: "Root Rot / Overwatering",
    symptoms: "Wilting, yellow leaves, mushy or brown roots, bad smell from soil.",
    tips: [
      "Let soil dry between waterings; ensure pots have drainage holes.",
      "Use well-draining potting mix; avoid heavy, waterlogged soil.",
      "Remove affected roots and repot in fresh, dry mix if caught early.",
    ],
    solutions: [
      "Stop watering until top inch of soil is dry. Improve drainage.",
      "Repot into fresh mix and a clean pot; trim away rotted roots.",
      "Reduce watering frequency; water only when needed.",
    ],
    medicines: [
      "No chemical cure; correct watering and drainage are essential.",
      "Hydrogen peroxide dilute drench (1 part 3% H2O2 to 4 parts water) may help oxygenate and suppress pathogens.",
    ],
  },
  {
    keywords: ["yellow leaves", "chlorosis", "yellowing", "pale yellow", "light yellow", "faded leaves"],
    name: "Yellow Leaves (General)",
    symptoms: "Leaves turning yellow; can be due to water, light, or nutrients.",
    tips: [
      "Overwatering: let soil dry; improve drainage.",
      "Underwatering: water when top inch is dry.",
      "Low light: move to brighter indirect light. Nitrogen deficiency: feed with balanced fertilizer.",
    ],
    solutions: [
      "Adjust watering schedule based on plant and season.",
      "Feed with balanced liquid fertilizer at half strength if nutrient issue suspected.",
      "Check for pests on undersides of leaves.",
    ],
    medicines: [
      "Liquid fertilizer (N-P-K balanced or nitrogen-focused if yellowing from bottom).",
      "Iron chelate if yellowing between veins (chlorosis).",
    ],
  },
  {
    keywords: ["black spot", "black spots", "rose disease"],
    name: "Black Spot",
    symptoms: "Black or dark brown spots on leaves, often with yellow halos; leaves drop.",
    tips: [
      "Water at base; avoid wetting foliage. Remove and destroy fallen leaves.",
      "Space plants for air flow; prune to open canopy.",
    ],
    solutions: [
      "Spray with fungicide containing chlorothalonil or copper.",
      "Sulfur or neem oil as preventive organic options.",
    ],
    medicines: [
      "Copper-based fungicide (organic option).",
      "Chlorothalonil or systemic fungicide (chemical, follow label).",
    ],
  },
  {
    keywords: ["leaf spot", "spots on leaves", "brown spots"],
    name: "Leaf Spot Diseases",
    symptoms: "Circular or irregular brown/black spots on leaves.",
    tips: [
      "Remove infected leaves; avoid overhead watering.",
      "Improve air circulation; don’t crowd plants.",
    ],
    solutions: [
      "Copper fungicide or neem oil as directed.",
      "Ensure good sanitation; disinfect tools between plants.",
    ],
    medicines: [
      "Copper soap or copper fungicide (organic).",
      "Broad-spectrum fungicide (chemical) if severe.",
    ],
  },
  {
    keywords: ["default", "unknown", "general"],
    name: "General Plant Care",
    symptoms: "Unclear or mixed symptoms.",
    tips: [
      "Describe the plant, where it’s growing (indoor/outdoor), and what changed (watering, light, new plants nearby).",
      "Check for pests on undersides of leaves and along stems.",
      "Ensure good drainage, appropriate light, and avoid overwatering.",
    ],
    solutions: [
      "Isolate affected plant to prevent spread. Remove badly damaged leaves.",
      "Apply neem oil as a broad-spectrum organic option for both pests and some fungi.",
      "Correct watering and light first; many issues improve with better care.",
    ],
    medicines: [
      "Neem oil (general organic option).",
      "Insecticidal soap for soft-bodied pests. Fungicide only if fungal disease is confirmed.",
    ],
  },
];

function matchFallback(query) {
  const q = (query || "").toLowerCase().trim();
  if (!q) return FALLBACK_KNOWLEDGE.find((x) => x.keywords.includes("default"));

  for (const entry of FALLBACK_KNOWLEDGE) {
    if (entry.keywords.some((k) => k !== "default" && q.includes(k))) {
      return entry;
    }
  }
  return FALLBACK_KNOWLEDGE.find((x) => x.keywords.includes("default"));
}

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
          { role: "user", content: query },
        ],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI API error:", res.status, err);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Parse JSON (handle possible markdown wrapper)
    const jsonStr = content.replace(/^```json?\s*|\s*```$/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("OpenAI request failed:", e.message);
    return null;
  }
}

// POST /api/ai/pest-advice  { "query": "user description of pest/symptoms/disease" }
exports.getPestAdvice = async (req, res) => {
  try {
    const { query } = req.body || {};
    const text = (typeof query === "string" ? query : "").trim();
    if (!text) {
      return res.status(400).json({ error: "Query is required (pest name, symptoms, or plant problem)." });
    }

    // 1) Try OpenAI if key is set
    const aiResult = await getAdviceFromOpenAI(text);
    if (aiResult && aiResult.name) {
      return res.json({
        source: "openai",
        name: aiResult.name,
        symptoms: aiResult.symptoms || "",
        tips: Array.isArray(aiResult.tips) ? aiResult.tips : [],
        solutions: Array.isArray(aiResult.solutions) ? aiResult.solutions : [],
        medicines: Array.isArray(aiResult.medicines) ? aiResult.medicines : [],
      });
    }

    // 2) Try database search for matching pests (Supabase)
    const q = `%${text}%`;
    const { data: dbPests = [], error: dbErr } = await supabase
      .from('pests')
      .select('*')
      .or(`name.ilike.${q},symptoms.ilike.${q},affected_plants.ilike.${q}`)
      .limit(3);
    if (dbErr) throw dbErr;

    if (dbPests && dbPests.length > 0) {
      const p = dbPests[0];
      const treatment = p.treatment || "";
      const prevention = p.prevention || "";
      return res.json({
        source: "database",
        name: p.name,
        symptoms: p.symptoms || "",
        tips: prevention ? prevention.split(/[.;]\s*/).filter(Boolean).slice(0, 5) : [],
        solutions: treatment ? treatment.split(/[.;]\s*/).filter(Boolean).slice(0, 5) : [],
        medicines: ["See treatment steps above; use organic options first (neem oil, soap, copper)."],
      });
    }

    // 3) Fallback knowledge base
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
    res.status(500).json({ error: "Failed to get pest advice." });
  }
};
