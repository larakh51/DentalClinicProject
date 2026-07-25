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

    if (!settings.vat_percentage) {
      settings.vat_percentage = "18";
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get settings",
      error: error.sqlMessage || error.message,
    });
  }
};

const getVatPercentage = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT setting_value
       FROM clinic_settings
       WHERE setting_key = 'vat_percentage'
       LIMIT 1`,
    );

    res.json({
      vat_percentage: rows.length > 0 ? rows[0].setting_value : "18",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get VAT percentage",
      error: error.sqlMessage || error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const entries = Object.entries(req.body);

    if (req.body.vat_percentage !== undefined) {
      const vatPercentage = Number(req.body.vat_percentage);

      if (
        Number.isNaN(vatPercentage) ||
        vatPercentage < 0 ||
        vatPercentage > 100
      ) {
        return res.status(400).json({
          message: "VAT percentage must be between 0 and 100",
        });
      }
    }

    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO clinic_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)],
      );
    }

    res.json({
      message: "Settings updated successfully",
    });
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

    const duration = Number(durationMinutes);
    const treatmentPrice = Number(price || 0);

    if (Number.isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        message: "Treatment duration must be greater than zero",
      });
    }

    if (Number.isNaN(treatmentPrice) || treatmentPrice < 0) {
      return res.status(400).json({
        message: "Treatment price cannot be negative",
      });
    }

    const id = "tt" + Date.now();

    await pool.query(
      `INSERT INTO treatment_types
       (id, name, duration_minutes, price, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [id, name.trim(), duration, treatmentPrice],
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

const updateTreatmentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, durationMinutes, price } = req.body;

    if (!name || !durationMinutes) {
      return res.status(400).json({
        message: "Treatment name and duration are required",
      });
    }

    const duration = Number(durationMinutes);
    const treatmentPrice = Number(price);

    if (Number.isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        message: "Treatment duration must be greater than zero",
      });
    }

    if (Number.isNaN(treatmentPrice) || treatmentPrice < 0) {
      return res.status(400).json({
        message: "Treatment price cannot be negative",
      });
    }

    const [result] = await pool.query(
      `UPDATE treatment_types
       SET name = ?,
           duration_minutes = ?,
           price = ?
       WHERE id = ?
         AND status = 'active'`,
      [name.trim(), duration, treatmentPrice, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Treatment type not found",
      });
    }

    res.json({
      message: "Treatment type updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update treatment type",
      error: error.sqlMessage || error.message,
    });
  }
};

const deleteTreatmentType = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE treatment_types
       SET status = 'inactive'
       WHERE id = ?
         AND status = 'active'`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Treatment type not found",
      });
    }

    res.json({
      message: "Treatment type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete treatment type",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getSettings,
  getVatPercentage,
  updateSettings,
  getTreatmentTypes,
  createTreatmentType,
  updateTreatmentType,
  deleteTreatmentType,
};
