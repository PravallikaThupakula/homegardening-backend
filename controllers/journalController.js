const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { uploadFile } = require("../utils/storage");
const supabase = require("../config/supabaseClient");

// Get all journal entries for a user
exports.getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new journal entry
exports.createJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plant_id, title, notes, mood, weather } = req.body;

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      try {
        imageUrl = await uploadFile(fileName, req.file.buffer, req.file.mimetype);
      } catch (e) {
        console.error('S3 upload error:', e.message);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    const { data, error } = await supabase.from("journals").insert([
      {
        id: undefined, // let DB generate uuid if configured
        user_id: userId,
        plant_id: plant_id || null,
        title,
        content: notes,
        mood,
        weather,
        image_url: imageUrl,
      },
    ]);
    if (error) throw error;
    res.status(201).json(data && data[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get journal entry by ID
exports.getJournalEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .limit(1);
    if (error) throw error;
    const item = data && data[0];
    if (!item) return res.status(404).json({ error: "Journal entry not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update journal entry
exports.updateJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, notes, mood, weather } = req.body;

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      try {
        imageUrl = await uploadFile(fileName, req.file.buffer, req.file.mimetype);
      } catch (e) {
        console.error('S3 upload error:', e.message);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    const updateData = { title, content: notes, mood, weather };
    if (imageUrl) updateData.image_url = imageUrl;

    const { data, error } = await supabase
      .from("journals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*");
    if (error) throw error;
    const updated = data && data[0];
    if (!updated) return res.status(404).json({ error: 'Journal entry not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete journal entry
exports.deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("journals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("*");
    if (error) throw error;
    if (!data || !data.length) return res.status(404).json({ error: 'Journal entry not found' });
    res.json({ message: "Journal entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
