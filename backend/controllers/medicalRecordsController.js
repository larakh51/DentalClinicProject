const pool = require("../database/db");

const getMedicalRecordByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const [records] = await pool.query(
      "SELECT * FROM medical_records WHERE patient_id = ?",
      [patientId],
    );

    const [treatments] = await pool.query(
      `SELECT *
       FROM treatments
       WHERE patient_id = ?
       ORDER BY date DESC`,
      [patientId],
    );

    res.json({
      medicalRecord: records[0] || null,
      treatments,
    });
  } catch (error) {
    console.error("GET MEDICAL RECORD ERROR:", error);

    res.status(500).json({
      message: "Failed to get medical record",
      error: error.sqlMessage || error.message,
    });
  }
};

const createOrUpdateMedicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { allergies, chronicDiseases, notes } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM medical_records WHERE patient_id = ?",
      [patientId],
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE medical_records
         SET allergies = ?, chronic_diseases = ?, notes = ?
         WHERE patient_id = ?`,
        [allergies || null, chronicDiseases || null, notes || null, patientId],
      );

      return res.json({
        message: "Medical record updated successfully",
      });
    }

    const id = "mr" + Date.now();

    await pool.query(
      `INSERT INTO medical_records
       (id, patient_id, allergies, chronic_diseases, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        patientId,
        allergies || null,
        chronicDiseases || null,
        notes || null,
      ],
    );

    res.status(201).json({
      message: "Medical record created successfully",
      id,
    });
  } catch (error) {
    console.error("SAVE MEDICAL RECORD ERROR:", error);

    res.status(500).json({
      message: "Failed to save medical record",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getMedicalRecordByPatient,
  createOrUpdateMedicalRecord,
};
