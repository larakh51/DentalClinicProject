const pool = require("../database/db");

const getInvoices = async (req, res) => {
  try {
    const { patientId, status } = req.query;

    let sql = `
      SELECT
        id,
        patient_id,
        patient_name,
        date,
        amount,
        status,
        created_at,
        updated_at
      FROM invoices
      WHERE 1=1
    `;

    const params = [];

    if (patientId) {
      sql += " AND patient_id = ?";
      params.push(patientId);
    }

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY date DESC";

    const [invoices] = await pool.query(sql, params);

    res.json(invoices);
  } catch (error) {
    console.error("GET INVOICES ERROR:", error);

    res.status(500).json({
      message: "Failed to get invoices",
      error: error.sqlMessage || error.message,
    });
  }
};

const getFinanceStats = async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS totalRevenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS collected,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'unpaid', 'partial', 'overdue') THEN amount ELSE 0 END), 0) AS pending
      FROM invoices
    `);

    res.json({
      totalRevenue: Number(stats.totalRevenue || 0),
      collected: Number(stats.collected || 0),
      pending: Number(stats.pending || 0),
    });
  } catch (error) {
    console.error("GET FINANCE STATS ERROR:", error);

    res.status(500).json({
      message: "Failed to get finance stats",
      error: error.sqlMessage || error.message,
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [invoices] = await pool.query(
      `
      SELECT
        id,
        patient_id,
        patient_name,
        date,
        amount,
        status,
        created_at,
        updated_at
      FROM invoices
      WHERE id = ?
      `,
      [id],
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(invoices[0]);
  } catch (error) {
    console.error("GET INVOICE BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to get invoice",
      error: error.sqlMessage || error.message,
    });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "paid",
      "unpaid",
      "partial",
      "cancelled",
      "pending",
      "overdue",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid invoice status",
      });
    }

    await pool.query("UPDATE invoices SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({
      message: "Invoice status updated successfully",
    });
  } catch (error) {
    console.error("UPDATE INVOICE STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update invoice",
      error: error.sqlMessage || error.message,
    });
  }
};

const createPayment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { patientId, amount, paymentMethod, date } = req.body;

    if (!patientId || !amount || !paymentMethod || !date) {
      await connection.rollback();

      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const paymentId = "pay" + Date.now();

    const [patients] = await connection.query(
      "SELECT first_name, last_name FROM users WHERE id = ?",
      [patientId],
    );

    const patientName =
      patients.length > 0
        ? `${patients[0].first_name} ${patients[0].last_name}`
        : null;

    await connection.query(
      `INSERT INTO invoices
   (id, patient_id, patient_name, date, amount, status)
   VALUES (?, ?, ?, ?, ?, 'unpaid')`,
      [invoiceId, patientId, patientName, date, cost],
    );

    const [payments] = await connection.query(
      "SELECT SUM(amount) AS totalPaid FROM payments WHERE invoice_id = ?",
      [id],
    );

    const [invoices] = await connection.query(
      "SELECT amount FROM invoices WHERE id = ?",
      [id],
    );

    if (invoices.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const totalPaid = Number(payments[0].totalPaid || 0);
    const invoiceAmount = Number(invoices[0].amount || 0);

    let newStatus = "unpaid";

    if (totalPaid >= invoiceAmount) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partial";
    }

    await connection.query("UPDATE invoices SET status = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    await connection.commit();

    res.status(201).json({
      message: "Payment saved successfully",
      paymentId,
      invoiceStatus: newStatus,
    });
  } catch (error) {
    await connection.rollback();

    console.error("CREATE PAYMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to save payment",
      error: error.sqlMessage || error.message,
    });
  } finally {
    connection.release();
  }
};

const getPaymentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [payments] = await pool.query(
      `SELECT
         p.id,
         p.invoice_id,
         p.patient_id,
         p.amount,
         p.payment_method,
         p.date,
         i.status AS invoice_status
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       WHERE p.patient_id = ?
       ORDER BY p.date DESC`,
      [patientId],
    );

    res.json(payments);
  } catch (error) {
    console.error("GET PAYMENTS BY PATIENT ERROR:", error);

    res.status(500).json({
      message: "Failed to get payments",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getInvoices,
  getFinanceStats,
  getInvoiceById,
  updateInvoiceStatus,
  createPayment,
  getPaymentsByPatient,
};
