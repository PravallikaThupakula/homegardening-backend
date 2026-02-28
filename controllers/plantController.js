const supabase = require("../config/supabaseClient");

// Get all plants from database
exports.getAllPlants = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get plant by ID
exports.getPlantById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("id", id)
      .limit(1);
    if (error) throw error;
    const item = data && data[0];
    if (!item) return res.status(404).json({ error: "Plant not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Search plants by name or type
exports.searchPlants = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const q = `%${query}%`;
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .or(`name.ilike.${q},type.ilike.${q},description.ilike.${q}`)
      .order("name", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get plants by region/climate
exports.getPlantsByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .contains("suitable_regions", [region])
      .order("name", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
