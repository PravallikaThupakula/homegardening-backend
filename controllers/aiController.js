const supabase = require('../config/supabaseClient');

// Get AI-based plant care suggestions
exports.getAISuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's plants
    const { data: plants = [], error: pErr } = await supabase.from('gardenitems').select('*').eq('user_id', userId);
    if (pErr) throw pErr;

    // Get user's location
    const { data: users = [], error: uErr } = await supabase.from('users').select('location,xp,streak,level').eq('id', userId).limit(1);
    if (uErr) throw uErr;
    const user = users && users[0];

    // Analyze plants and generate suggestions
    const suggestions = [];

    plants.forEach((plant) => {
      const today = new Date();
      const lastWatered = plant.last_watered ? new Date(plant.last_watered) : null;
      
      if (lastWatered) {
        const diffDays = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= plant.watering_frequency) {
          suggestions.push({
            plant_id: plant.id,
            plant_name: plant.growth_notes || "Your plant",
            type: "watering",
            priority: "high",
            message: `${plant.growth_notes || "Your plant"} needs watering. It's been ${diffDays} days since last watering.`,
            action: "water",
          });
        }
      } else {
        suggestions.push({
          plant_id: plant.id,
          plant_name: plant.growth_notes || "Your plant",
          type: "watering",
          priority: "high",
          message: `${plant.growth_notes || "Your plant"} hasn't been watered yet.`,
          action: "water",
        });
      }

      // Check sunlight requirements
      if (!plant.sunlight_requirement) {
        suggestions.push({
          plant_id: plant.id,
          plant_name: plant.growth_notes || "Your plant",
          type: "care",
          priority: "medium",
          message: `Consider adding sunlight requirement information for ${plant.growth_notes || "your plant"}.`,
          action: "update_info",
        });
      }
    });

    // Add seasonal tips based on location
    if (user?.location) {
      const currentMonth = new Date().getMonth() + 1;
      let season = "spring";
      if (currentMonth >= 3 && currentMonth <= 5) season = "spring";
      else if (currentMonth >= 6 && currentMonth <= 8) season = "summer";
      else if (currentMonth >= 9 && currentMonth <= 11) season = "fall";
      else season = "winter";

      suggestions.push({
        type: "seasonal",
        priority: "low",
        message: `It's ${season} in ${user.location}. Consider seasonal care adjustments for your plants.`,
        action: "view_seasonal_tips",
      });
    }

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get personalized care tips for a specific plant
exports.getPlantCareTips = async (req, res) => {
  try {
    const { plantId } = req.params;
    const userId = req.user.id;

    // Get plant details
    const { data: plantArr = [], error: plErr } = await supabase.from('gardenitems').select('*').eq('id', plantId).eq('user_id', userId).limit(1);
    if (plErr) throw plErr;
    const plant = plantArr && plantArr[0];
    if (!plant) return res.status(404).json({ error: "Plant not found" });

    // Generate personalized tips
    const tips = [];

    // Watering tip
    if (plant.last_watered) {
      const today = new Date();
      const lastWatered = new Date(plant.last_watered);
      const diffDays = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
      
      if (diffDays < plant.watering_frequency) {
        const daysUntilWater = plant.watering_frequency - diffDays;
        tips.push({
          type: "watering",
          tip: `Water in ${daysUntilWater} day(s). Keep soil moist but not waterlogged.`,
        });
      }
    }

    // Growth tip
    if (plant.planting_date) {
      const today = new Date();
      const plantingDate = new Date(plant.planting_date);
      const daysSincePlanting = Math.floor((today - plantingDate) / (1000 * 60 * 60 * 24));
      
      tips.push({
        type: "growth",
        tip: `Your plant has been growing for ${daysSincePlanting} days. Monitor for any signs of stress or disease.`,
      });
    }

    // General care tips
    tips.push({
      type: "general",
      tip: "Ensure adequate drainage in your pot to prevent root rot.",
    });

    tips.push({
      type: "general",
      tip: "Check leaves regularly for pests or discoloration.",
    });

    res.json({ plant, tips });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
