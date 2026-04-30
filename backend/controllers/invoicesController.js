const pool = require("../database/db");

const getInvoices = async (req, res) => {
  try {
    const { patientId, status } = req.query;

    let sql = "SELECT * FROM invoices WHERE 1=1";
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
    res
      .status(500)
      .json({ message: "Failed to get invoices", error: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [invoices] = await pool.query("SELECT * FROM invoices WHERE id = ?", [
      id,
    ]);

    if (invoices.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoices[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get invoice", error: error.message });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["paid", "unpaid", "partial", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid invoice status" });
    }

    await pool.query("UPDATE invoices SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({ message: "Invoice status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update invoice", error: error.message });
  }
};

const createPayment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { patientId, amount, paymentMethod, date } = req.body;

    const paymentId = "pay" + Date.now();

    await connection.query(
      `INSERT INTO payments
       (id, invoice_id, patient_id, amount, payment_method, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, id, patientId, amount, paymentMethod, date],
    );

    const [payments] = await connection.query(
      "SELECT SUM(amount) AS totalPaid FROM payments WHERE invoice_id = ?",
      [id],
    );

    const [invoices] = await connection.query(
      "SELECT amount FROM invoices WHERE id = ?",
      [id],
    );

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
    res
      .status(500)
      .json({ message: "Failed to save payment", error: error.message });
  } finally {
    connection.release();
  }
};

const getPaymentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [payments] = await pool.query(
      `SELECT *
       FROM payments
       WHERE patient_id = ?
       ORDER BY date DESC`,
      [patientId],
    );

    res.json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get payments", error: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  createPayment,
  getPaymentsByPatient,
};
