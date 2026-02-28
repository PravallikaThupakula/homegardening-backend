const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const { addXP, updateStreak } = require("../utils/xpHelpers");
const supabase = require('../config/supabaseClient');
const { scanPlantImage } = require("../controllers/plantScanController");

const upload = multer({ storage: multer.memoryStorage() });

// GET all plants
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('gardenitems').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD plant (JSON body – no image) – use this when frontend sends name only
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { plant_name, watering_frequency } = req.body;
    const name = (plant_name || "").toString().trim();
    if (!name) return res.status(400).json({ error: "plant_name is required" });

    const { data, error } = await supabase.from('gardenitems').insert([
      {
        user_id: req.user.id,
        growth_notes: name,
        watering_frequency: Number(watering_frequency) || 2,
      }
    ]).select('*');
    if (error) throw error;
    await addXP(supabase, req.user.id, 10);
    res.json({ message: "Plant added", data: data && data[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADD plant with required image (multipart) — scan image for health status
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    const {
      plant_name,
      watering_frequency,
      plant_type,
      sunlight_requirement,
      soil_type,
      planting_date,
      notes
    } = req.body;

    const name = (plant_name || "").toString().trim();
    if (!name) return res.status(400).json({ error: "plant_name is required" });
    if (!req.file) return res.status(400).json({ error: "Plant image is required" });

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { uploadFile } = require("../utils/storage");
    let imageUrl;
    try {
      imageUrl = await uploadFile(fileName, req.file.buffer, req.file.mimetype);
    } catch (e) {
      console.error('S3 upload error:', e.message);
      return res.status(500).json({ error: 'Image upload failed' });
    }

    let health_status = null;
    try {
      const scan = await scanPlantImage(imageUrl);
      health_status = scan.status;
    } catch (e) {
      console.error("Scan on add failed:", e.message);
    }

    const insert = {
      user_id: req.user.id,
      growth_notes: name,
      watering_frequency: Number(watering_frequency) || 2,
      image_url: imageUrl,
      plant_type: plant_type || null,
      sunlight_requirement: sunlight_requirement || null,
      soil_type: soil_type || null,
      planting_date: planting_date ? new Date(planting_date).toISOString() : new Date().toISOString(),
      notes: notes || null,
      health_status: health_status || null,
    };
    const { data, error } = await supabase.from('gardenitems').insert([insert]).select('*');
    if (error) throw error;
    await addXP(supabase, req.user.id, 10);
    res.json({ message: "Plant added", data: data && data[0] });
  }
);

// Re-scan plant: upload new image, run AI scan, update health_status; +10 XP if good (must be before PUT /:id)
router.put("/:id/rescan", authMiddleware, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: "Image is required to re-scan" });

  const fileName = `${Date.now()}-${req.file.originalname}`;
  const { uploadFile } = require("../utils/storage");
  let imageUrl;
  try {
    imageUrl = await uploadFile(fileName, req.file.buffer, req.file.mimetype);
  } catch (e) {
    console.error('S3 upload error:', e.message);
    return res.status(500).json({ error: 'Image upload failed' });
  }

  let health_status = "Needs Care";
  let isGood = false;
  try {
    const scan = await scanPlantImage(imageUrl);
    health_status = scan.status;
    isGood = scan.isGood;
  } catch (e) {
    console.error("Rescan failed:", e.message);
  }

  const { data: updatedArr, error: upErr } = await supabase.from('gardenitems').update({ image_url: imageUrl, health_status }).eq('id', id).eq('user_id', req.user.id).select('*');
  if (upErr) return res.status(500).json({ error: upErr.message });
  const updated = updatedArr && updatedArr[0];
  if (!updated) return res.status(404).json({ error: 'Plant not found' });
  if (isGood) await addXP(supabase, req.user.id, 10);
  res.json({ message: "Plant re-scanned", data: updated, growth_points: isGood ? 10 : 0 });
});

// UPDATE plant (name, watering, etc. — no image)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const {
    plant_name,
    watering_frequency,
    plant_type,
    sunlight_requirement,
    soil_type,
    notes
  } = req.body;

  const updateData = {
    growth_notes: plant_name,
    watering_frequency,
    plant_type,
    sunlight_requirement,
    soil_type,
    notes,
  };
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  const { data: updatedArr, error: upErr } = await supabase.from('gardenitems').update(updateData).eq('id', id).eq('user_id', req.user.id).select('*');
  if (upErr) return res.status(500).json({ error: upErr.message });
  const updated = updatedArr && updatedArr[0];
  if (!updated) return res.status(404).json({ error: 'Plant not found' });
  res.json({ message: "Plant updated", data: updated });
});

// WATER plant (logs to watering_logs, +5 XP, streak update)
router.put("/water/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  const { data: updatedArr, error: upErr } = await supabase.from('gardenitems').update({ last_watered: new Date(now).toISOString() }).eq('id', id).eq('user_id', req.user.id).select('*');
  if (upErr) return res.status(500).json({ error: upErr.message });
  const updated = updatedArr && updatedArr[0];
  if (!updated) return res.status(404).json({ error: 'Plant not found' });

  const { error: logErr } = await supabase.from('watering_logs').insert([
    { user_id: req.user.id, plant_id: id, watered_at: now }
  ]);
  if (logErr) console.error('watering log error', logErr.message);
  await addXP(supabase, req.user.id, 5);
  await updateStreak(supabase, req.user.id);

  res.json({ message: "Plant watered", data: updated });
});

// DELETE plant
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase.from('gardenitems').delete().eq('id', id).eq('user_id', req.user.id).select('*');
  if (error) return res.status(500).json({ error: error.message });
  if (!data || !data.length) return res.status(404).json({ error: 'Plant not found' });
  res.json({ message: "Plant deleted" });
});

module.exports = router;