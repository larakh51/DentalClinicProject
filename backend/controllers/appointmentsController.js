const pool = require("../database/db");

const getAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, date } = req.query;

    let sql = "SELECT * FROM appointments WHERE 1=1";
    const params = [];

    if (doctorId) {
      sql += " AND doctor_id = ?";
      params.push(doctorId);
    }

    if (patientId) {
      sql += " AND patient_id = ?";
      params.push(patientId);
    }

    if (date) {
      sql += " AND date = ?";
      params.push(date);
    }

    sql += " ORDER BY date, time";

    const [appointments] = await pool.query(sql, params);

    res.json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get appointments", error: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      doctorName,
      date,
      time,
      treatmentType,
      notes,
    } = req.body;

    const [existing] = await pool.query(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled'`,
      [doctorId, date, time],
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "This time is already booked" });
    }

    const id = "a" + Date.now();

    await pool.query(
      `INSERT INTO appointments 
       (id, patient_id, patient_name, doctor_id, doctor_name, date, time, treatment_type, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
      [
        id,
        patientId,
        patientName,
        doctorId,
        doctorName,
        date,
        time,
        treatmentType,
        notes || null,
      ],
    );

    res.status(201).json({ message: "Appointment created successfully", id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create appointment", error: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "scheduled",
      "completed",
      "cancelled",
      "confirmed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }

    await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({ message: "Appointment status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
};
