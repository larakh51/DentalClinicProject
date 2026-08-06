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

const createInvoice = async (req, res) => {
  try {
    const { patientId, amount, date } = req.body;

    const invoiceAmount = Number(amount);

    if (
      !patientId ||
      !date ||
      !Number.isFinite(invoiceAmount) ||
      invoiceAmount <= 0
    ) {
      return res.status(400).json({
        message: "Missing or invalid invoice fields",
      });
    }

    const [patients] = await pool.query(
      `SELECT first_name, last_name
       FROM users
       WHERE id = ? AND role = 'patient'`,
      [patientId],
    );

    if (patients.length === 0) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const patientName =
      `${patients[0].first_name} ${patients[0].last_name}`.trim();

    const invoiceId = `inv${Date.now()}`;

    await pool.query(
      `INSERT INTO invoices
       (id, patient_id, patient_name, date, amount, status)
       VALUES (?, ?, ?, ?, ?, 'unpaid')`,
      [invoiceId, patientId, patientName, date, invoiceAmount],
    );

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: {
        id: invoiceId,
        patient_id: patientId,
        patient_name: patientName,
        date,
        amount: invoiceAmount,
        status: "unpaid",
      },
    });
  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);

    res.status(500).json({
      message: "Failed to create invoice",
      error: error.sqlMessage || error.message,
    });
  }
};

const getOrCreateAppointmentInvoice = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const [appointments] = await pool.query(
      `
      SELECT
        a.id,
        a.patient_id,
        a.date,
        a.status,
        a.treatment_type,

        COALESCE(
          a.patient_name,
          CONCAT(patient.first_name, ' ', patient.last_name)
        ) AS patient_name,

        COALESCE(
          a.booked_price,
          treatment.price,
          0
        ) AS treatment_price

      FROM appointments a

      LEFT JOIN users patient
        ON a.patient_id = patient.id

      LEFT JOIN treatment_types treatment
        ON a.treatment_type_id = treatment.id

      WHERE a.id = ?
      `,
      [appointmentId],
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    const appointment = appointments[0];

    if (String(appointment.status || "").toLowerCase() !== "completed") {
      return res.status(400).json({
        message: "The appointment must be completed before payment",
      });
    }

    const treatmentPrice = Number(appointment.treatment_price || 0);

    if (!Number.isFinite(treatmentPrice) || treatmentPrice <= 0) {
      return res.status(400).json({
        message: "No valid price was found for this treatment",
      });
    }

    const [existingInvoices] = await pool.query(
      `
      SELECT
        i.id,
        i.appointment_id,
        i.patient_id,
        i.patient_name,
        i.date,
        i.amount,
        i.status,
        appointment.treatment_type,

        COALESCE(
          (
            SELECT SUM(payment.amount)
            FROM payments payment
            WHERE payment.invoice_id = i.id
          ),
          0
        ) AS paid_amount,

        GREATEST(
          i.amount -
          COALESCE(
            (
              SELECT SUM(payment.amount)
              FROM payments payment
              WHERE payment.invoice_id = i.id
            ),
            0
          ),
          0
        ) AS remaining_amount

      FROM invoices i

      LEFT JOIN appointments appointment
        ON i.appointment_id = appointment.id

      WHERE i.appointment_id = ?

      LIMIT 1
      `,
      [appointmentId],
    );

    if (existingInvoices.length > 0) {
      return res.json({
        invoice: {
          ...existingInvoices[0],
          amount: Number(existingInvoices[0].amount || 0),
          paid_amount: Number(existingInvoices[0].paid_amount || 0),
          remaining_amount: Number(existingInvoices[0].remaining_amount || 0),
        },
      });
    }

    const invoiceId = `inv${Date.now()}`;

    await pool.query(
      `
      INSERT INTO invoices
      (
        id,
        appointment_id,
        patient_id,
        patient_name,
        date,
        amount,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'unpaid')
      `,
      [
        invoiceId,
        appointment.id,
        appointment.patient_id,
        appointment.patient_name,
        appointment.date,
        treatmentPrice,
      ],
    );

    res.status(201).json({
      invoice: {
        id: invoiceId,
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name,
        treatment_type: appointment.treatment_type,
        date: appointment.date,
        amount: treatmentPrice,
        paid_amount: 0,
        remaining_amount: treatmentPrice,
        status: "unpaid",
      },
    });
  } catch (error) {
    console.error("GET OR CREATE APPOINTMENT INVOICE ERROR:", error);

    res.status(500).json({
      message: "Failed to prepare treatment invoice",
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

    const paymentAmount = Number(amount);

    if (
      !patientId ||
      !paymentMethod ||
      !date ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      await connection.rollback();

      return res.status(400).json({
        message: "Missing or invalid payment fields",
      });
    }

    const [invoices] = await connection.query(
      `
      SELECT
        id,
        patient_id,
        amount,
        status
      FROM invoices
      WHERE id = ?
      `,
      [id],
    );

    if (invoices.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const invoice = invoices[0];

    if (String(invoice.patient_id) !== String(patientId)) {
      await connection.rollback();

      return res.status(400).json({
        message: "The patient does not match this invoice",
      });
    }

    const currentStatus = String(invoice.status || "").toLowerCase();

    if (currentStatus === "paid") {
      await connection.rollback();

      return res.status(400).json({
        message: "This invoice is already paid",
      });
    }

    if (currentStatus === "cancelled") {
      await connection.rollback();

      return res.status(400).json({
        message: "Payments cannot be added to a cancelled invoice",
      });
    }

    const [[paymentStats]] = await connection.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS totalPaid
      FROM payments
      WHERE invoice_id = ?
      `,
      [id],
    );

    const previousTotalPaid = Number(paymentStats.totalPaid || 0);
    const invoiceAmount = Number(invoice.amount || 0);
    const remainingAmount = Math.max(invoiceAmount - previousTotalPaid, 0);

    if (remainingAmount <= 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "This invoice is already fully paid",
      });
    }

    if (paymentAmount > remainingAmount) {
      await connection.rollback();

      return res.status(400).json({
        message: `Payment amount cannot exceed ₪${remainingAmount.toFixed(2)}`,
      });
    }

    const paymentId = `pay${Date.now()}`;

    await connection.query(
      `
      INSERT INTO payments
      (
        id,
        invoice_id,
        patient_id,
        amount,
        payment_method,
        date
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [paymentId, id, patientId, paymentAmount, paymentMethod, date],
    );

    const totalPaid = previousTotalPaid + paymentAmount;

    const newStatus = totalPaid >= invoiceAmount ? "paid" : "partial";

    await connection.query(
      `
      UPDATE invoices
      SET status = ?
      WHERE id = ?
      `,
      [newStatus, id],
    );

    await connection.commit();

    res.status(201).json({
      message: "Payment saved successfully",
      paymentId,
      invoiceStatus: newStatus,
      paidAmount: totalPaid,
      remainingAmount: Math.max(invoiceAmount - totalPaid, 0),
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
  createInvoice,
  getOrCreateAppointmentInvoice,
  updateInvoiceStatus,
  createPayment,
  getPaymentsByPatient,
};
