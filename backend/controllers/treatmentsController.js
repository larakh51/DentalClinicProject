const pool = require("../database/db");

const getTreatments = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId } = req.query;

    let sql = `
      SELECT
        t.id,
        t.appointment_id,
        t.patient_id,
        t.doctor_id,
        t.description,
        t.materials,
        t.cost,
        t.date,
        CONCAT(patient.first_name, ' ', patient.last_name) AS patient_name,
        CONCAT('Dr. ', doctor.first_name, ' ', doctor.last_name) AS doctor_name
      FROM treatments t
      LEFT JOIN users patient ON t.patient_id = patient.id
      LEFT JOIN users doctor ON t.doctor_id = doctor.id
      WHERE 1=1
    `;

    const params = [];

    if (patientId) {
      sql += " AND t.patient_id = ?";
      params.push(patientId);
    }

    if (doctorId) {
      sql += " AND t.doctor_id = ?";
      params.push(doctorId);
    }

    if (appointmentId) {
      sql += " AND t.appointment_id = ?";
      params.push(appointmentId);
    }

    sql += " ORDER BY t.date DESC";

    const [treatments] = await pool.query(sql, params);

    res.json(treatments);
  } catch (error) {
    console.error("GET TREATMENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get treatments",
      error: error.sqlMessage || error.message,
    });
  }
};

const getTreatmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [treatments] = await pool.query(
      `
      SELECT
        t.id,
        t.appointment_id,
        t.patient_id,
        t.doctor_id,
        t.description,
        t.materials,
        t.cost,
        t.date,
        CONCAT(patient.first_name, ' ', patient.last_name) AS patient_name,
        CONCAT('Dr. ', doctor.first_name, ' ', doctor.last_name) AS doctor_name
      FROM treatments t
      LEFT JOIN users patient ON t.patient_id = patient.id
      LEFT JOIN users doctor ON t.doctor_id = doctor.id
      WHERE t.id = ?
      `,
      [id],
    );

    if (treatments.length === 0) {
      return res.status(404).json({
        message: "Treatment not found",
      });
    }

    res.json(treatments[0]);
  } catch (error) {
    console.error("GET TREATMENT BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to get treatment",
      error: error.sqlMessage || error.message,
    });
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

    if (!patientId || !doctorId || !description || !cost || !date) {
      await connection.rollback();

      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const id = "t" + Date.now();

    await connection.query(
      `INSERT INTO treatments
       (id, appointment_id, patient_id, doctor_id, description, materials, cost, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        appointmentId || null,
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

    console.error("CREATE TREATMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to create treatment",
      error: error.sqlMessage || error.message,
    });
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

    res.json({
      message: "Treatment updated successfully",
    });
  } catch (error) {
    console.error("UPDATE TREATMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to update treatment",
      error: error.sqlMessage || error.message,
    });
  }
};

const deleteTreatment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM treatments WHERE id = ?", [id]);

    res.json({
      message: "Treatment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TREATMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete treatment",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
};
