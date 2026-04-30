const pool = require("../database/db");

const getTreatments = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId } = req.query;

    let sql = "SELECT * FROM treatments WHERE 1=1";
    const params = [];

    if (patientId) {
      sql += " AND patient_id = ?";
      params.push(patientId);
    }

    if (doctorId) {
      sql += " AND doctor_id = ?";
      params.push(doctorId);
    }

    if (appointmentId) {
      sql += " AND appointment_id = ?";
      params.push(appointmentId);
    }

    sql += " ORDER BY date DESC";

    const [treatments] = await pool.query(sql, params);

    res.json(treatments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get treatments", error: error.message });
  }
};

const getTreatmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [treatments] = await pool.query(
      "SELECT * FROM treatments WHERE id = ?",
      [id],
    );

    if (treatments.length === 0) {
      return res.status(404).json({ message: "Treatment not found" });
    }

    res.json(treatments[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get treatment", error: error.message });
  }
};

const createTreatment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      appointmentId,
      patientId,
      doctorId,
      description,
      materials,
      cost,
      date,
    } = req.body;

    const id = "t" + Date.now();

    await connection.query(
      `INSERT INTO treatments
       (id, appointment_id, patient_id, doctor_id, description, materials, cost, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        appointmentId,
        patientId,
        doctorId,
        description,
        materials || null,
        cost,
        date,
      ],
    );

    if (appointmentId) {
      await connection.query(
        "UPDATE appointments SET status = 'completed' WHERE id = ?",
        [appointmentId],
      );
    }

    const invoiceId = "inv" + Date.now();

    await connection.query(
      `INSERT INTO invoices
       (id, patient_id, treatment_id, amount, status, date)
       VALUES (?, ?, ?, ?, 'unpaid', ?)`,
      [invoiceId, patientId, id, cost, date],
    );

    await connection.commit();

    res.status(201).json({
      message: "Treatment created and invoice generated successfully",
      treatmentId: id,
      invoiceId,
    });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Failed to create treatment", error: error.message });
  } finally {
    connection.release();
  }
};

const updateTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, materials, cost, date } = req.body;

    await pool.query(
      `UPDATE treatments
       SET description = ?, materials = ?, cost = ?, date = ?
       WHERE id = ?`,
      [description, materials || null, cost, date, id],
    );

    res.json({ message: "Treatment updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update treatment", error: error.message });
  }
};

const deleteTreatment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM treatments WHERE id = ?", [id]);

    res.json({ message: "Treatment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete treatment", error: error.message });
  }
};

module.exports = {
  getTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
};
