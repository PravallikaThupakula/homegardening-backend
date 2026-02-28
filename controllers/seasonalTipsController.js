import supabase from "../config/supabaseClient.js";

/* ================= GET CURRENT SEASON ================= */
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

/* ================= GET SEASONAL TIPS ================= */
export const getSeasonalTips = async (req, res) => {
  try {
    const { region, season } = req.query;

    let query = supabase.from("seasonal_tips").select("*");

    if (region) {
      query = query.contains("regions", [region]);
    }

    if (season) {
      query = query.eq("season", season);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error)
      return res.status(400).json({ error: error.message });

    res.json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GET SEASONAL TIPS BY PLACE ================= */
export const getSeasonalTipsByPlace = async (req, res) => {
  try {
    const place = (req.query.place || "").trim();
    const season = (
      req.query.season || getCurrentSeason()
    ).toLowerCase();

    if (!place) {
      return res.status(400).json({
        error:
          "Place is required (e.g. village, region, country, district).",
      });
    }

    /* 1️⃣ Try Database */
    let dbTips = [];

    try {
      const { data, error } = await supabase
        .from("seasonal_tips")
        .select("*")
        .eq("season", season)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data?.length) {
        const placeLower = place.toLowerCase();

        dbTips = data.filter(
          (t) =>
            (t.title &&
              t.title.toLowerCase().includes(placeLower)) ||
            (Array.isArray(t.regions) &&
              t.regions.some((r) =>
                String(r)
                  .toLowerCase()
                  .includes(placeLower)
              ))
        );
      }
    } catch {}

    if (dbTips.length > 0) {
      return res.json(dbTips);
    }

    /* 2️⃣ Try OpenAI */
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const resOpenAI = await fetch(
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
                {
                  role: "system",
                  content: `You are a gardening expert. Given a place and season, respond with a JSON array of 3-5 tips. Each item: { "title": "...", "content": "..." }. No markdown.`,
                },
                {
                  role: "user",
                  content: `Place: ${place}. Season: ${season}.`,
                },
              ],
              temperature: 0.5,
              max_tokens: 600,
            }),
          }
        );

        if (resOpenAI.ok) {
          const data = await resOpenAI.json();
          const raw =
            data.choices?.[0]?.message?.content?.trim() ||
            "";

          const jsonStr = raw
            .replace(/^```json?\s*|\s*```$/g, "")
            .trim();

          const tips = JSON.parse(jsonStr);

          if (Array.isArray(tips) && tips.length > 0) {
            return res.json(
              tips.map((t, i) => ({
                id: `ai-${i}`,
                title: t.title || `Tip ${i + 1}`,
                content: t.content || "",
                season,
                regions: [place],
              }))
            );
          }
        }
      } catch (e) {
        console.error(
          "Seasonal tips OpenAI error:",
          e.message
        );
      }
    }

    /* 3️⃣ Fallback */
    const fallbacks = {
      spring: [
        {
          id: "fb-1",
          title: "Start seeds indoors",
          content:
            "Spring is ideal for starting seeds indoors with good light and drainage.",
          season: "spring",
          regions: [place],
        },
      ],
      summer: [
        {
          id: "fb-1",
          title: "Water wisely",
          content:
            "Water early morning and mulch to reduce evaporation.",
          season: "summer",
          regions: [place],
        },
      ],
      fall: [
        {
          id: "fb-1",
          title: "Prepare for frost",
          content:
            "Harvest crops early and protect tender plants.",
          season: "fall",
          regions: [place],
        },
      ],
      winter: [
        {
          id: "fb-1",
          title: "Protect roots",
          content:
            "Mulch deeply and move potted plants indoors.",
          season: "winter",
          regions: [place],
        },
      ],
    };

    return res.json(fallbacks[season] || fallbacks.spring);
  } catch (error) {
    console.error(
      "Seasonal tips by place error:",
      error
    );
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GET TIP BY ID ================= */
export const getTipById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("seasonal_tips")
      .select("*")
      .eq("id", id)
      .single();

    if (error)
      return res.status(404).json({
        error: "Tip not found",
      });

    res.json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};