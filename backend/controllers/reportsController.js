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

    const [statusRows] = await pool.query(`
      SELECT
        LOWER(status) AS status,
        COUNT(*) AS count
      FROM appointments
      GROUP BY LOWER(status)
    `);

    const [monthlyRows] = await pool.query(`
      SELECT
        DATE_FORMAT(date, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM appointments
      WHERE date >= DATE_FORMAT(
        DATE_SUB(CURDATE(), INTERVAL 5 MONTH),
        '%Y-%m-01'
      )
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month
    `);

    const totalAppointments = Number(appointmentsStats.totalAppointments || 0);

    const completedAppointments = Number(
      appointmentsStats.completedAppointments || 0,
    );

    const completionRate =
      totalAppointments > 0
        ? Math.round((completedAppointments / totalAppointments) * 100)
        : 0;

    const statusBreakdown = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    statusRows.forEach((row) => {
      const status = String(row.status || "").toLowerCase();

      if (Object.prototype.hasOwnProperty.call(statusBreakdown, status)) {
        statusBreakdown[status] = Number(row.count || 0);
      }
    });

    const monthlyMap = new Map(
      monthlyRows.map((row) => [row.month, Number(row.count || 0)]),
    );

    const monthlyAppointments = [];
    const currentDate = new Date();

    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - offset,
        1,
      );

      const year = monthDate.getFullYear();
      const month = String(monthDate.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}-${month}`;

      monthlyAppointments.push({
        month: monthKey,
        count: monthlyMap.get(monthKey) || 0,
      });
    }

    res.json({
      totalAppointments,
      completedAppointments,
      completionRate,
      totalRevenue: Number(revenueStats.totalRevenue || 0),
      statusBreakdown,
      monthlyAppointments,
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
