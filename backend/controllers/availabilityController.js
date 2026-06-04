const pool = require("../database/db");

const defaultSchedule = [
  {
    dayName: "Sunday",
    openingTime: "09:00",
    closingTime: "19:00",
    isActive: 1,
  },
  {
    dayName: "Monday",
    openingTime: "09:00",
    closingTime: "19:00",
    isActive: 1,
  },
  {
    dayName: "Tuesday",
    openingTime: "09:00",
    closingTime: "19:00",
    isActive: 1,
  },
  {
    dayName: "Wednesday",
    openingTime: "09:00",
    closingTime: "19:00",
    isActive: 1,
  },
  {
    dayName: "Thursday",
    openingTime: "09:00",
    closingTime: "19:00",
    isActive: 1,
  },
  {
    dayName: "Friday",
    openingTime: "09:00",
    closingTime: "14:00",
    isActive: 1,
  },
];

const getMyAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, doctor_id, day_name, opening_time, closing_time, is_active
       FROM doctor_availability
       WHERE doctor_id = ?
       ORDER BY FIELD(day_name, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
      [doctorId],
    );

    if (rows.length === 0) {
      for (const day of defaultSchedule) {
        await pool.query(
          `INSERT INTO doctor_availability
           (doctor_id, day_name, opening_time, closing_time, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [
            doctorId,
            day.dayName,
            day.openingTime,
            day.closingTime,
            day.isActive,
          ],
        );
      }

      const [createdRows] = await pool.query(
        `SELECT id, doctor_id, day_name, opening_time, closing_time, is_active
         FROM doctor_availability
         WHERE doctor_id = ?
         ORDER BY FIELD(day_name, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
        [doctorId],
      );

      return res.json(createdRows);
    }

    res.json(rows);
  } catch (error) {
    console.error("GET AVAILABILITY ERROR:", error);

    res.status(500).json({
      message: "Failed to get availability",
      error: error.sqlMessage || error.message,
    });
  }
};

const updateMyAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      return res.status(400).json({
        message: "Schedule must be an array",
      });
    }

    for (const day of schedule) {
      await pool.query(
        `UPDATE doctor_availability
         SET opening_time = ?, closing_time = ?, is_active = ?
         WHERE id = ? AND doctor_id = ?`,
        [
          day.opening_time,
          day.closing_time,
          day.is_active ? 1 : 0,
          day.id,
          doctorId,
        ],
      );
    }

    res.json({
      message: "Availability updated successfully",
    });
  } catch (error) {
    console.error("UPDATE AVAILABILITY ERROR:", error);

    res.status(500).json({
      message: "Failed to update availability",
      error: error.sqlMessage || error.message,
    });
  }
};

const getMyTimeOff = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const [requests] = await pool.query(
      `SELECT id, doctor_id, start_date, end_date, reason, status, created_at
       FROM doctor_time_off
       WHERE doctor_id = ?
       ORDER BY start_date DESC`,
      [doctorId],
    );

    res.json(requests);
  } catch (error) {
    console.error("GET TIME OFF ERROR:", error);

    res.status(500).json({
      message: "Failed to get time off requests",
      error: error.sqlMessage || error.message,
    });
  }
};

const createTimeOffRequest = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const id = "off" + Date.now();

    await pool.query(
      `INSERT INTO doctor_time_off
       (id, doctor_id, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [id, doctorId, startDate, endDate, reason || null],
    );

    res.status(201).json({
      message: "Time off request submitted successfully",
      id,
    });
  } catch (error) {
    console.error("CREATE TIME OFF ERROR:", error);

    res.status(500).json({
      message: "Failed to create time off request",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getMyAvailability,
  updateMyAvailability,
  getMyTimeOff,
  createTimeOffRequest,
};
