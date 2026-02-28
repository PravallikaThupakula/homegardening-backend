const supabase = require("../config/supabaseClient");

// Get user's shopping list
exports.getShoppingList = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add item to shopping list
exports.addShoppingItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_name, category, quantity, priority } = req.body;

    const { data, error } = await supabase
      .from("shopping_list")
      .insert([
        {
          user_id: userId,
          item_name,
          category: category || "general",
          quantity: quantity || 1,
          priority: priority || "medium",
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update shopping list item
exports.updateShoppingItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { item_name, category, quantity, priority, completed } = req.body;

    const { data, error } = await supabase
      .from("shopping_list")
      .update({
        item_name,
        category,
        quantity,
        priority,
        completed,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete shopping list item
exports.deleteShoppingItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Generate shopping list from user's plants
exports.generateFromPlants = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's plants
    const { data: plants, error: plantsError } = await supabase
      .from("user_garden")
      .select("plant_type, watering_frequency")
      .eq("user_id", userId);

    if (plantsError) return res.status(400).json({ error: plantsError.message });

    // Generate suggested items based on plants
    const suggestedItems = [
      { item_name: "Watering Can", category: "tools", priority: "high" },
      { item_name: "Potting Soil", category: "supplies", priority: "high" },
      { item_name: "Fertilizer", category: "supplies", priority: "medium" },
    ];

    // Add items if not already in list
    for (const item of suggestedItems) {
      const { data: existing } = await supabase
        .from("shopping_list")
        .select("*")
        .eq("user_id", userId)
        .eq("item_name", item.item_name)
        .eq("completed", false)
        .single();

      if (!existing) {
        await supabase.from("shopping_list").insert([
          {
            user_id: userId,
            ...item,
            quantity: 1,
            completed: false,
          },
        ]);
      }
    }

    res.json({ message: "Shopping list generated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
