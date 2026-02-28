import multer from "multer";
import supabase from "../config/supabaseClient.js";
import { uploadFile } from "../utils/storage.js";

export const upload = multer({ storage: multer.memoryStorage() });

/* ================= GET ALL JOURNAL ENTRIES ================= */
export const getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= CREATE JOURNAL ENTRY ================= */
export const createJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plant_id, title, notes, mood, weather } = req.body;

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      try {
        imageUrl = await uploadFile(
          fileName,
          req.file.buffer,
          req.file.mimetype
        );
      } catch (e) {
        console.error("S3 upload error:", e.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const { data, error } = await supabase
      .from("journals")
      .insert([
        {
          user_id: userId,
          plant_id: plant_id || null,
          title,
          content: notes,
          mood,
          weather,
          image_url: imageUrl,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data?.[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= GET JOURNAL ENTRY BY ID ================= */
export const getJournalEntryById = async (req, res) => {
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

    const item = data?.[0];
    if (!item)
      return res.status(404).json({ error: "Journal entry not found" });

    res.json(item);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= UPDATE JOURNAL ENTRY ================= */
export const updateJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, notes, mood, weather } = req.body;

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      try {
        imageUrl = await uploadFile(
          fileName,
          req.file.buffer,
          req.file.mimetype
        );
      } catch (e) {
        console.error("S3 upload error:", e.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const updateData = {
      title,
      content: notes,
      mood,
      weather,
    };

    if (imageUrl) updateData.image_url = imageUrl;

    const { data, error } = await supabase
      .from("journals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) throw error;

    const updated = data?.[0];
    if (!updated)
      return res.status(404).json({ error: "Journal entry not found" });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= DELETE JOURNAL ENTRY ================= */
export const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("journals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) throw error;

    if (!data?.length)
      return res.status(404).json({ error: "Journal entry not found" });

    res.json({ message: "Journal entry deleted successfully" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};