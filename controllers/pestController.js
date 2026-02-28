const supabase = require("../config/supabaseClient");

// Get all pests and diseases
exports.getAllPests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pests")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get pest by ID
exports.getPestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("pests")
      .select("*")
      .eq("id", id)
      .limit(1);
    if (error) throw error;
    const item = data && data[0];
    if (!item) return res.status(404).json({ error: "Pest/Disease not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Search pests by name or symptoms
exports.searchPests = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.status(400).json({ error: "Search query required" });

    const q = `%${query}%`;
    const { data, error } = await supabase
      .from("pests")
      .select("*")
      .or(`name.ilike.${q},symptoms.ilike.${q},affected_plants.ilike.${q}`)
      .order("name", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get pests by plant type
exports.getPestsByPlant = async (req, res) => {
  try {
    const { plantType } = req.params;
    const { data, error } = await supabase
      .from("pests")
      .select("*")
      .contains("affected_plants", [plantType])
      .order("name", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
