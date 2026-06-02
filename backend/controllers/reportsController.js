const pool = require("../database/db");

const getManagerReports = async (req, res) => {
  try {
    const [[appointmentsStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalAppointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedAppointments
      FROM appointments
    `);

    const [[revenueStats]] = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS totalRevenue
      FROM invoices
      WHERE status = 'paid'
    `);

    const totalAppointments = Number(appointmentsStats.totalAppointments || 0);

    const completedAppointments = Number(
      appointmentsStats.completedAppointments || 0,
    );

    const completionRate =
      totalAppointments > 0
        ? Math.round((completedAppointments / totalAppointments) * 100)
        : 0;

    res.json({
      totalAppointments,
      completedAppointments,
      completionRate,
      totalRevenue: Number(revenueStats.totalRevenue || 0),
    });
  } catch (error) {
    console.error("GET MANAGER REPORTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get manager reports",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getManagerReports,
};
