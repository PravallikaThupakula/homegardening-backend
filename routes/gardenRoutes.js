import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";
import { addXP, updateStreak } from "../utils/xpHelpers.js";
import supabase from "../config/supabaseClient.js";
import { scanPlantImage } from "../controllers/plantScanController.js";
import { uploadFile } from "../utils/storage.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ================= GET ALL PLANTS ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("gardenitems")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ADD PLANT (JSON ONLY) ================= */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { plant_name, watering_frequency } = req.body;
    const name = (plant_name || "").trim();

    if (!name)
      return res.status(400).json({ error: "plant_name is required" });

    const { data, error } = await supabase
      .from("gardenitems")
      .insert([
        {
          user_id: req.user.id,
          growth_notes: name,
          watering_frequency: Number(watering_frequency) || 2,
        },
      ])
      .select("*");

    if (error) throw error;

    await addXP(supabase, req.user.id, 10);

    res.json({ message: "Plant added", data: data?.[0] });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= ADD PLANT WITH IMAGE ================= */
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const {
      plant_name,
      watering_frequency,
      plant_type,
      sunlight_requirement,
      soil_type,
      planting_date,
      notes,
    } = req.body;

    const name = (plant_name || "").trim();
    if (!name)
      return res.status(400).json({ error: "plant_name is required" });

    if (!req.file)
      return res.status(400).json({ error: "Plant image is required" });

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const imageUrl = await uploadFile(
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    let health_status = null;
    try {
      const scan = await scanPlantImage(imageUrl);
      health_status = scan.status;
    } catch (e) {
      console.error("Scan failed:", e.message);
    }

    const insert = {
      user_id: req.user.id,
      growth_notes: name,
      watering_frequency: Number(watering_frequency) || 2,
      image_url: imageUrl,
      plant_type: plant_type || null,
      sunlight_requirement: sunlight_requirement || null,
      soil_type: soil_type || null,
      planting_date: planting_date
        ? new Date(planting_date).toISOString()
        : new Date().toISOString(),
      notes: notes || null,
      health_status,
    };

    const { data, error } = await supabase
      .from("gardenitems")
      .insert([insert])
      .select("*");

    if (error) throw error;

    await addXP(supabase, req.user.id, 10);

    res.json({ message: "Plant added", data: data?.[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= RESCAN PLANT ================= */
router.put("/:id/rescan", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file)
      return res.status(400).json({ error: "Image is required to re-scan" });

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const imageUrl = await uploadFile(
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    let health_status = "Needs Care";
    let isGood = false;

    try {
      const scan = await scanPlantImage(imageUrl);
      health_status = scan.status;
      isGood = scan.isGood;
    } catch (e) {
      console.error("Rescan failed:", e.message);
    }

    const { data, error } = await supabase
      .from("gardenitems")
      .update({ image_url: imageUrl, health_status })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("*");

    if (error) return res.status(500).json({ error: error.message });

    if (!data?.length)
      return res.status(404).json({ error: "Plant not found" });

    if (isGood) await addXP(supabase, req.user.id, 10);

    res.json({
      message: "Plant re-scanned",
      data: data[0],
      growth_points: isGood ? 10 : 0,
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= WATER PLANT ================= */
router.put("/water/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("gardenitems")
      .update({ last_watered: now })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("*");

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.length)
      return res.status(404).json({ error: "Plant not found" });

    await supabase.from("watering_logs").insert([
      { user_id: req.user.id, plant_id: id, watered_at: now },
    ]);

    await addXP(supabase, req.user.id, 5);
    await updateStreak(supabase, req.user.id);

    res.json({ message: "Plant watered", data: data[0] });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= DELETE PLANT ================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("gardenitems")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("*");

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.length)
      return res.status(404).json({ error: "Plant not found" });

    res.json({ message: "Plant deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;