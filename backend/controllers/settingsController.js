const pool = require("../database/db");

const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM clinic_settings",
    );

    const settings = {};

    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get settings",
      error: error.sqlMessage || error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const entries = Object.entries(req.body);

    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO clinic_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)],
      );
    }

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update settings",
      error: error.sqlMessage || error.message,
    });
  }
};

const getTreatmentTypes = async (req, res) => {
  try {
    const [types] = await pool.query(
      `SELECT id, name, duration_minutes, price, status
       FROM treatment_types
       WHERE status = 'active'
       ORDER BY name`,
    );

    res.json(types);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get treatment types",
      error: error.sqlMessage || error.message,
    });
  }
};

const createTreatmentType = async (req, res) => {
  try {
    const { name, durationMinutes, price } = req.body;

    if (!name || !durationMinutes) {
      return res.status(400).json({
        message: "Treatment name and duration are required",
      });
    }

    const id = "tt" + Date.now();

    await pool.query(
      `INSERT INTO treatment_types
       (id, name, duration_minutes, price, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [id, name, durationMinutes, price || 0],
    );

    res.status(201).json({
      message: "Treatment type added successfully",
      id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create treatment type",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getTreatmentTypes,
  createTreatmentType,
};
