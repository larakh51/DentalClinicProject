const pool = require("../database/db");

const getAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, date } = req.query;

    let sql = `
      SELECT
        a.id,
        a.patient_id,
        a.doctor_id,
        a.date,
        a.time,
        a.end_time,
        a.duration_minutes,
        a.treatment_type_id,
        a.treatment_type,
        a.status,
        a.notes,

        COALESCE(
          a.patient_name,
          CONCAT(patient.first_name, ' ', patient.last_name)
        ) AS patient_name,

        COALESCE(
          a.doctor_name,
          CONCAT('Dr. ', doctor.first_name, ' ', doctor.last_name)
        ) AS doctor_name

      FROM appointments a
      LEFT JOIN users patient ON a.patient_id = patient.id
      LEFT JOIN users doctor ON a.doctor_id = doctor.id
      WHERE 1=1
    `;

    const params = [];

    if (doctorId) {
      sql += " AND a.doctor_id = ?";
      params.push(doctorId);
    }

    if (patientId) {
      sql += " AND a.patient_id = ?";
      params.push(patientId);
    }

    if (date) {
      sql += " AND a.date = ?";
      params.push(date);
    }

    sql += " ORDER BY a.date DESC, a.time DESC";

    const [appointments] = await pool.query(sql, params);

    res.json(appointments);
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get appointments",
      error: error.sqlMessage || error.message,
    });
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
      treatmentTypeId,
      treatmentType,
      notes,
    } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    let finalTreatmentType = treatmentType || null;
    let durationMinutes = 30;
    let finalTreatmentTypeId = treatmentTypeId || null;

    if (treatmentTypeId) {
      const [types] = await pool.query(
        `SELECT id, name, duration_minutes
         FROM treatment_types
         WHERE id = ? AND status = 'active'`,
        [treatmentTypeId],
      );

      if (types.length === 0) {
        return res.status(400).json({
          message: "Invalid treatment type",
        });
      }

      finalTreatmentType = types[0].name;
      durationMinutes = Number(types[0].duration_minutes || 30);
      finalTreatmentTypeId = types[0].id;
    }

    if (!finalTreatmentType) {
      return res.status(400).json({
        message: "Treatment type is required",
      });
    }

    const [[endResult]] = await pool.query(
      `SELECT ADDTIME(?, SEC_TO_TIME(? * 60)) AS endTime`,
      [time, durationMinutes],
    );

    const endTime = endResult.endTime;

    const [conflicts] = await pool.query(
      `SELECT id, time, end_time
       FROM appointments
       WHERE doctor_id = ?
         AND date = ?
         AND status != 'cancelled'
         AND time < ?
         AND COALESCE(end_time, ADDTIME(time, SEC_TO_TIME(COALESCE(duration_minutes, 30) * 60))) > ?`,
      [doctorId, date, endTime, time],
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "This doctor is not available during the selected time",
      });
    }

    const id = "a" + Date.now();

    await pool.query(
      `INSERT INTO appointments 
       (
        id,
        patient_id,
        patient_name,
        doctor_id,
        doctor_name,
        date,
        time,
        end_time,
        duration_minutes,
        treatment_type_id,
        treatment_type,
        status,
        notes
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
      [
        id,
        patientId,
        patientName || null,
        doctorId,
        doctorName || null,
        date,
        time,
        endTime,
        durationMinutes,
        finalTreatmentTypeId,
        finalTreatmentType,
        notes || null,
      ],
    );

    res.status(201).json({
      message: "Appointment created successfully",
      id,
    });
  } catch (error) {
    console.error("CREATE APPOINTMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to create appointment",
      error: error.sqlMessage || error.message,
    });
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
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({
      message: "Appointment status updated successfully",
    });
  } catch (error) {
    console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update status",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
};
