const pool = require("../database/db");
const {
  AppointmentStatusError,
  changeAppointmentStatus,
} = require("../services/appointmentStatusService");

const formatSqlDate = (date) => {
  if (!date) return "";

  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(date).split("T")[0];
};

const normalizeTime = (time) => {
  if (!time) return "";

  const value = String(time);

  if (value.length === 5) {
    return `${value}:00`;
  }

  return value;
};

const isValidSqlDate = (date) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""));
};

const getDoctorAppointmentCounts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         doctor_id,
         COUNT(*) AS total_appointments
       FROM appointments
       WHERE doctor_id IS NOT NULL
       GROUP BY doctor_id`,
    );

    const appointmentCounts = {};

    rows.forEach((row) => {
      appointmentCounts[row.doctor_id] = Number(row.total_appointments || 0);
    });

    res.json(appointmentCounts);
  } catch (error) {
    console.error("GET DOCTOR APPOINTMENT COUNTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get doctor appointment counts",
      error: error.sqlMessage || error.message,
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, date, fromDate, toDate } = req.query;

    if (date && !isValidSqlDate(date)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (fromDate && !isValidSqlDate(fromDate)) {
      return res.status(400).json({
        message: "Invalid fromDate format",
      });
    }

    if (toDate && !isValidSqlDate(toDate)) {
      return res.status(400).json({
        message: "Invalid toDate format",
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        message: "fromDate must be before toDate",
      });
    }

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
      LEFT JOIN users patient
        ON a.patient_id = patient.id
      LEFT JOIN users doctor
        ON a.doctor_id = doctor.id
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

    if (fromDate) {
      sql += " AND a.date >= ?";
      params.push(fromDate);
    }

    if (toDate) {
      sql += " AND a.date <= ?";
      params.push(toDate);
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointmentDate = new Date(`${date}T00:00:00`);
    appointmentDate.setHours(0, 0, 0, 0);

    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate <= today) {
      return res.status(400).json({
        message: "Appointments cannot be booked for the same day",
      });
    }

    let finalTreatmentType = treatmentType || null;
    let durationMinutes = 30;
    let finalTreatmentTypeId = treatmentTypeId || null;

    if (treatmentTypeId) {
      const [types] = await pool.query(
        `SELECT id, name, duration_minutes
         FROM treatment_types
         WHERE id = ?
           AND status = 'active'`,
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
      `SELECT ADDTIME(
         ?,
         SEC_TO_TIME(? * 60)
       ) AS endTime`,
      [time, durationMinutes],
    );

    const endTime = endResult.endTime;
    const clinicClosingTime = "19:00:00";

    if (String(endTime).slice(0, 8) > clinicClosingTime) {
      return res.status(400).json({
        message: "The appointment must end before the clinic closes at 19:00",
      });
    }

    const [conflicts] = await pool.query(
      `SELECT id, time, end_time
       FROM appointments
       WHERE doctor_id = ?
         AND date = ?
         AND status != 'cancelled'
         AND time < ?
         AND COALESCE(
           end_time,
           ADDTIME(
             time,
             SEC_TO_TIME(
               COALESCE(duration_minutes, 30) * 60
             )
           )
         ) > ?`,
      [doctorId, date, endTime, time],
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "This doctor is not available during the selected time",
      });
    }

    const id = `a${Date.now()}`;

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
       VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
         'scheduled',
         ?
       )`,
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

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      date,
      time,
      treatment_type,
      treatmentType,
      treatmentTypeId,
      status,
      notes,
    } = req.body;

    const [appointments] = await pool.query(
      "SELECT * FROM appointments WHERE id = ?",
      [id],
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    const appointment = appointments[0];

    const finalDate = date
      ? formatSqlDate(date)
      : formatSqlDate(appointment.date);

    const finalTime = time
      ? normalizeTime(time)
      : normalizeTime(appointment.time);

    let finalTreatmentType =
      treatmentType !== undefined
        ? treatmentType
        : treatment_type !== undefined
          ? treatment_type
          : appointment.treatment_type;

    let finalTreatmentTypeId =
      treatmentTypeId !== undefined
        ? treatmentTypeId
        : appointment.treatment_type_id;

    let durationMinutes = Number(appointment.duration_minutes || 30);

    if (finalTreatmentTypeId) {
      const [types] = await pool.query(
        `SELECT id, name, duration_minutes
         FROM treatment_types
         WHERE id = ?`,
        [finalTreatmentTypeId],
      );

      if (types.length > 0) {
        finalTreatmentType = types[0].name;

        durationMinutes = Number(types[0].duration_minutes || 30);

        finalTreatmentTypeId = types[0].id;
      }
    }

    const [[endResult]] = await pool.query(
      `SELECT ADDTIME(
         ?,
         SEC_TO_TIME(? * 60)
       ) AS endTime`,
      [finalTime, durationMinutes],
    );

    const endTime = endResult.endTime;

    const finalStatus = status || appointment.status || "scheduled";

    const allowedStatuses = [
      "scheduled",
      "completed",
      "cancelled",
      "confirmed",
    ];

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    if (finalStatus === "completed") {
      const [[completionCheck]] = await pool.query(
        `SELECT TIMESTAMP(?, ?) <= NOW() AS can_complete`,
        [finalDate, finalTime],
      );

      if (!Number(completionCheck.can_complete)) {
        return res.status(400).json({
          message:
            "The appointment cannot be completed before its scheduled date and time",
        });
      }
    }

    if (finalStatus !== "cancelled") {
      const [conflicts] = await pool.query(
        `SELECT id, time, end_time
         FROM appointments
         WHERE doctor_id = ?
           AND date = ?
           AND id != ?
           AND status != 'cancelled'
           AND time < ?
           AND COALESCE(
             end_time,
             ADDTIME(
               time,
               SEC_TO_TIME(
                 COALESCE(duration_minutes, 30) * 60
               )
             )
           ) > ?`,
        [appointment.doctor_id, finalDate, id, endTime, finalTime],
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          message: "This doctor is not available during the selected time",
        });
      }
    }

    await pool.query(
      `UPDATE appointments
       SET date = ?,
           time = ?,
           end_time = ?,
           duration_minutes = ?,
           treatment_type_id = ?,
           treatment_type = ?,
           status = ?,
           notes = ?
       WHERE id = ?`,
      [
        finalDate,
        finalTime,
        endTime,
        durationMinutes,
        finalTreatmentTypeId || null,
        finalTreatmentType || null,
        finalStatus,
        notes !== undefined ? notes || null : appointment.notes,
        id,
      ],
    );

    res.json({
      message: "Appointment updated successfully",
    });
  } catch (error) {
    console.error("UPDATE APPOINTMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to update appointment",
      error: error.sqlMessage || error.message,
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === "completed") {
      const [appointments] = await pool.query(
        `SELECT
           id,
           TIMESTAMP(date, time) <= NOW() AS can_complete
         FROM appointments
         WHERE id = ?`,
        [id],
      );

      if (appointments.length === 0) {
        return res.status(404).json({
          message: "Appointment not found",
        });
      }

      if (!Number(appointments[0].can_complete)) {
        return res.status(400).json({
          message:
            "The appointment cannot be completed before its scheduled date and time",
        });
      }
    }

    const appointment = await changeAppointmentStatus({
      database: pool,
      appointmentId: id,
      nextStatus: status,
      actor: req.user,
    });

    return res.json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    if (error instanceof AppointmentStatusError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

    return res.status(500).json({
      message: "Failed to update appointment status",
    });
  }
};

module.exports = {
  getAppointments,
  getDoctorAppointmentCounts,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
};
