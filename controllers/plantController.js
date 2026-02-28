import supabase from "../config/supabaseClient.js";

/* ================= GET ALL PLANTS ================= */
export const getAllPlants = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GET PLANT BY ID ================= */
export const getPlantById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error) throw error;

    const item = data?.[0];
    if (!item)
      return res
        .status(404)
        .json({ error: "Plant not found" });

    res.json(item);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= SEARCH PLANTS ================= */
export const searchPlants = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ error: "Search query required" });
    }

    const q = `%${query}%`;

    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .or(
        `name.ilike.${q},type.ilike.${q},description.ilike.${q}`
      )
      .order("name", { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GET PLANTS BY REGION ================= */
export const getPlantsByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .contains("suitable_regions", [region])
      .order("name", { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};