const supabase = require("../config/supabaseClient");

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

// Get seasonal tips by region and season
exports.getSeasonalTips = async (req, res) => {
  try {
    const { region, season } = req.query;

    let query = supabase.from("seasonal_tips").select("*");

    if (region) {
      query = query.contains("regions", [region]);
    }

    if (season) {
      query = query.eq("season", season);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get tips by place (village, region, country, district) — AI or fallback
exports.getSeasonalTipsByPlace = async (req, res) => {
  try {
    const place = (req.query.place || "").trim();
    const season = (req.query.season || getCurrentSeason()).toLowerCase();

    if (!place) {
      return res.status(400).json({ error: "Place is required (e.g. village, region, country, district)." });
    }

    // 1) Try DB: match place in title or regions
    let dbTips = [];
    try {
      const { data, error } = await supabase
        .from("seasonal_tips")
        .select("*")
        .eq("season", season)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data && data.length > 0) {
        const placeLower = place.toLowerCase();
        dbTips = data.filter(
          (t) =>
            (t.title && t.title.toLowerCase().includes(placeLower)) ||
            (Array.isArray(t.regions) && t.regions.some((r) => String(r).toLowerCase().includes(placeLower)))
        );
      }
    } catch (_) {}

    if (dbTips.length > 0) {
      return res.json(dbTips);
    }

    // 2) Try OpenAI for location-specific tips
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const resOpenAI = await fetch("https://api.openai.com/v1/chat/completions", {
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
                content: `You are a gardening expert. Given a place (village, region, district, country) and a season, respond with a JSON array of 3 to 5 tips. Each item: { "title": "short title", "content": "1-2 sentences of practical advice for that location and season" }. Consider local climate (tropical, temperate, arid, etc.) when relevant. No markdown, only valid JSON array.`,
              },
              {
                role: "user",
                content: `Place: ${place}. Season: ${season}. Give gardening tips for this location and season.`,
              },
            ],
            temperature: 0.5,
            max_tokens: 600,
          }),
        });

        if (resOpenAI.ok) {
          const data = await resOpenAI.json();
          const raw = data.choices?.[0]?.message?.content?.trim() || "";
          const jsonStr = raw.replace(/^```json?\s*|\s*```$/g, "").trim();
          const tips = JSON.parse(jsonStr);
          if (Array.isArray(tips) && tips.length > 0) {
            const normalized = tips.map((t, i) => ({
              id: `ai-${i}`,
              title: t.title || `Tip ${i + 1}`,
              content: t.content || "",
              season,
              regions: [place],
            }));
            return res.json(normalized);
          }
        }
      } catch (e) {
        console.error("Seasonal tips OpenAI error:", e.message);
      }
    }

    // 3) Fallback: generic tips for any location
    const fallbacks = {
      spring: [
        { id: "fb-1", title: "Start seeds indoors", content: "In many regions, spring is ideal for starting seeds indoors. Use a well-draining mix and provide enough light.", season: "spring", regions: [place] },
        { id: "fb-2", title: "Prepare soil", content: "Add compost and loosen soil before planting. Test drainage and adjust with sand or organic matter as needed for your area.", season: "spring", regions: [place] },
        { id: "fb-3", title: "Watch for frost", content: "Check local last-frost dates. Protect tender plants with cloches or row covers if frost is still possible in your region.", season: "spring", regions: [place] },
      ],
      summer: [
        { id: "fb-1", title: "Water wisely", content: "Water early morning or evening to reduce evaporation. Mulch to keep soil moist and cool. Adjust frequency based on your local heat and rainfall.", season: "summer", regions: [place] },
        { id: "fb-2", title: "Shade and shelter", content: "Provide shade for sensitive plants during the hottest part of the day. Use shade cloth or plant taller crops to the west.", season: "summer", regions: [place] },
        { id: "fb-3", title: "Pest watch", content: "Summer pests are active. Inspect leaves regularly; use neem oil or soap spray for soft-bodied insects. Encourage beneficial insects.", season: "summer", regions: [place] },
      ],
      fall: [
        { id: "fb-1", title: "Harvest and preserve", content: "Harvest remaining crops before frost. Dry herbs, store root vegetables in a cool place, and save seeds from open-pollinated plants.", season: "fall", regions: [place] },
        { id: "fb-2", title: "Plant for spring", content: "In many regions, fall is the time to plant bulbs, trees, and perennials. Soil is still warm and roots establish before winter.", season: "fall", regions: [place] },
        { id: "fb-3", title: "Clean up", content: "Remove diseased foliage; compost healthy material. Clear weeds to reduce overwintering pests. Mulch beds after ground cools.", season: "fall", regions: [place] },
      ],
      winter: [
        { id: "fb-1", title: "Protect plants", content: "Mulch roots, use row covers or cold frames where needed. Move potted plants to sheltered spots. Know your zone and typical frost dates.", season: "winter", regions: [place] },
        { id: "fb-2", title: "Plan and order", content: "Use winter to plan the next season: order seeds, plan crop rotation, and repair tools. Check what grows well in your region.", season: "winter", regions: [place] },
        { id: "fb-3", title: "Indoor growing", content: "Grow herbs and microgreens on a windowsill. Start onions and leeks in trays if your climate allows.", season: "winter", regions: [place] },
      ],
    };
    const list = fallbacks[season] || fallbacks.spring;
    return res.json(list);
  } catch (error) {
    console.error("Seasonal tips by place error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get tip by ID
exports.getTipById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("seasonal_tips")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "Tip not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
