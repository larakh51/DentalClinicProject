const { randomBytes } = require("node:crypto");

const ALLOWED_STATUSES = ["scheduled", "confirmed", "completed", "cancelled"];

class AppointmentStatusError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "AppointmentStatusError";
    this.statusCode = statusCode;
  }
}

const validateStatus = (nextStatus) => {
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw new AppointmentStatusError(400, "Invalid appointment status");
  }
};

const authorizeStatusChange = (actor, appointment, nextStatus) => {
  if (!actor) {
    throw new AppointmentStatusError(401, "Not authorized");
  }

  const isManager = actor.role === "manager";

  const isAssignedDoctor =
    actor.role === "doctor" && actor.id === appointment.doctor_id;

  const isAllowedPatientCancellation =
    actor.role === "patient" &&
    actor.id === appointment.patient_id &&
    nextStatus === "cancelled" &&
    ["scheduled", "confirmed"].includes(appointment.status);

  if (!isManager && !isAssignedDoctor && !isAllowedPatientCancellation) {
    throw new AppointmentStatusError(403, "You cannot update this appointment");
  }

  if (appointment.status === "completed" && nextStatus !== "completed") {
    throw new AppointmentStatusError(
      409,
      "Completed appointments cannot be reopened",
    );
  }
};

const createEntityId = (prefix) => `${prefix}${randomBytes(8).toString("hex")}`;

const loadAppointment = async (database, appointmentId, lock = false) => {
  const [appointments] = await database.query(
    `SELECT
       id,
       patient_id,
       doctor_id,
       status,
       treatment_type_id,
       treatment_type,
       patient_name,
       date,
       booked_price,
       booked_vat_percentage
     FROM appointments
     WHERE id = ?
     LIMIT 1${lock ? " FOR UPDATE" : ""}`,
    [appointmentId],
  );

  if (appointments.length === 0) {
    throw new AppointmentStatusError(404, "Appointment not found");
  }

  return appointments[0];
};

const updateSimpleStatus = async ({
  database,
  appointmentId,
  nextStatus,
  actor,
}) => {
  const appointment = await loadAppointment(database, appointmentId);

  authorizeStatusChange(actor, appointment, nextStatus);

  await database.query(
    `UPDATE appointments
     SET status = ?
     WHERE id = ?`,
    [nextStatus, appointmentId],
  );

  return {
    id: appointmentId,
    status: nextStatus,
  };
};

const resolveTreatmentCost = async (connection, appointment) => {
  const bookedPrice = Number(appointment.booked_price);

  if (Number.isFinite(bookedPrice) && bookedPrice > 0) {
    return bookedPrice;
  }

  let treatmentTypes = [];

  if (appointment.treatment_type_id) {
    [treatmentTypes] = await connection.query(
      `SELECT price
       FROM treatment_types
       WHERE id = ?
       LIMIT 1`,
      [appointment.treatment_type_id],
    );
  }

  if (treatmentTypes.length === 0) {
    [treatmentTypes] = await connection.query(
      `SELECT price
       FROM treatment_types
       WHERE name = ?
       LIMIT 1`,
      [appointment.treatment_type],
    );
  }

  const treatmentCost = Number(treatmentTypes[0]?.price || 0);

  if (!Number.isFinite(treatmentCost) || treatmentCost <= 0) {
    throw new AppointmentStatusError(
      400,
      `No valid price is configured for ${appointment.treatment_type}`,
    );
  }

  return treatmentCost;
};

const completeAppointment = async ({ database, appointmentId, actor }) => {
  let connection;
  let transactionStarted = false;

  try {
    connection = await database.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    const appointment = await loadAppointment(connection, appointmentId, true);

    authorizeStatusChange(actor, appointment, "completed");

    const treatmentCost = await resolveTreatmentCost(connection, appointment);

    await connection.query(
      `UPDATE appointments
       SET status = 'completed'
       WHERE id = ?`,
      [appointmentId],
    );

    const [existingTreatments] = await connection.query(
      `SELECT id
       FROM treatments
       WHERE appointment_id = ?
       LIMIT 1`,
      [appointmentId],
    );

    if (existingTreatments.length === 0) {
      await connection.query(
        `INSERT INTO treatments
         (
           id,
           appointment_id,
           patient_id,
           doctor_id,
           description,
           materials,
           cost,
           date
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          createEntityId("t"),
          appointmentId,
          appointment.patient_id,
          appointment.doctor_id,
          appointment.treatment_type,
          null,
          treatmentCost,
          appointment.date,
        ],
      );
    }

    const [automaticInvoicingSettings] = await connection.query(
      `SELECT setting_value
         FROM clinic_settings
         WHERE setting_key = 'automatic_invoicing'
         LIMIT 1`,
    );

    const automaticInvoicingEnabled =
      String(automaticInvoicingSettings[0]?.setting_value ?? "1") === "1";

    if (automaticInvoicingEnabled) {
      const [existingInvoices] = await connection.query(
        `SELECT id
           FROM invoices
           WHERE appointment_id = ?
           LIMIT 1`,
        [appointmentId],
      );

      if (existingInvoices.length === 0) {
        await connection.query(
          `INSERT INTO invoices
           (
             id,
             appointment_id,
             patient_id,
             patient_name,
             date,
             amount,
             status
           )
           VALUES (?, ?, ?, ?, ?, ?, 'unpaid')`,
          [
            createEntityId("inv"),
            appointmentId,
            appointment.patient_id,
            appointment.patient_name,
            appointment.date,
            treatmentCost,
          ],
        );
      }
    }

    await connection.commit();
    transactionStarted = false;

    return {
      id: appointmentId,
      status: "completed",
    };
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }

    throw error;
  } finally {
    connection?.release();
  }
};

const changeAppointmentStatus = async ({
  database,
  appointmentId,
  nextStatus,
  actor,
}) => {
  validateStatus(nextStatus);

  if (nextStatus === "completed") {
    return completeAppointment({
      database,
      appointmentId,
      actor,
    });
  }

  return updateSimpleStatus({
    database,
    appointmentId,
    nextStatus,
    actor,
  });
};

module.exports = {
  AppointmentStatusError,
  validateStatus,
  authorizeStatusChange,
  changeAppointmentStatus,
};
