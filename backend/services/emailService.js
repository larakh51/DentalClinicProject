const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("EMAIL SERVER ERROR:", error.message);
    return;
  }

  console.log("EMAIL SERVER READY");
});

const sendEmail = async ({ to, subject, html }) => {
  console.log("SENDING EMAIL TO:", to);

  const info = await transporter.sendMail({
    from: `"Khoury Dental Art" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log("EMAIL SENT:", info.messageId);

  return info;
};

const sendAppointmentConfirmationEmail = async ({
  to,
  clinicName = "Khoury Dental Art",
  patientName,
  doctorName,
  treatmentType,
  date,
  time,
}) => {
  return sendEmail({
    to,
    subject: `${clinicName} - Appointment Confirmation`,
    html: `
      <div style="
        max-width: 620px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        color: #1f2937;
        background: #ffffff;
      ">
        <div style="
          background: #0f9da5;
          padding: 24px;
          text-align: center;
          color: #ffffff;
        ">
          <h1 style="margin: 0; font-size: 24px;">
            ${clinicName}
          </h1>

          <p style="margin: 8px 0 0;">
            Appointment Confirmation
          </p>
        </div>

        <div style="padding: 30px;">
          <h2 style="margin-top: 0; color: #172d3a;">
            Hello ${patientName},
          </h2>

          <p style="line-height: 1.6;">
            Your dental appointment has been successfully scheduled.
          </p>

          <div style="
            margin: 24px 0;
            padding: 20px;
            background: #f4f9fa;
            border-radius: 10px;
          ">
            <p style="margin: 8px 0;">
              <strong>Treatment:</strong>
              ${treatmentType}
            </p>

            <p style="margin: 8px 0;">
              <strong>Doctor:</strong>
              ${doctorName || "Doctor"}
            </p>

            <p style="margin: 8px 0;">
              <strong>Date:</strong>
              ${date}
            </p>

            <p style="margin: 8px 0;">
              <strong>Time:</strong>
              ${time}
            </p>
          </div>

          <p style="line-height: 1.6;">
            Please arrive 10 minutes before your scheduled appointment.
          </p>

          <p style="margin-top: 28px;">
            Thank you,<br />
            <strong>${clinicName}</strong>
          </p>
        </div>
      </div>
    `,
  });
};

const sendAppointmentReminderEmail = async ({
  to,
  clinicName = "Khoury Dental Art",
  patientName,
  doctorName,
  treatmentType,
  date,
  time,
}) => {
  return sendEmail({
    to,
    subject: `${clinicName} - Appointment Reminder`,
    html: `
      <div style="
        max-width: 620px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        color: #1f2937;
        background: #ffffff;
      ">
        <div style="
          background: #0f9da5;
          padding: 24px;
          text-align: center;
          color: #ffffff;
        ">
          <h1 style="margin: 0; font-size: 24px;">
            ${clinicName}
          </h1>

          <p style="margin: 8px 0 0;">
            Appointment Reminder
          </p>
        </div>

        <div style="padding: 30px;">
          <h2 style="margin-top: 0; color: #172d3a;">
            Hello ${patientName},
          </h2>

          <p style="line-height: 1.6;">
            This is a reminder for your upcoming dental appointment.
          </p>

          <div style="
            margin: 24px 0;
            padding: 20px;
            background: #f4f9fa;
            border-radius: 10px;
          ">
            <p style="margin: 8px 0;">
              <strong>Treatment:</strong>
              ${treatmentType}
            </p>

            <p style="margin: 8px 0;">
              <strong>Doctor:</strong>
              ${doctorName || "Doctor"}
            </p>

            <p style="margin: 8px 0;">
              <strong>Date:</strong>
              ${date}
            </p>

            <p style="margin: 8px 0;">
              <strong>Time:</strong>
              ${time}
            </p>
          </div>

          <p style="line-height: 1.6;">
            We look forward to seeing you.
          </p>

          <p style="margin-top: 28px;">
            <strong>${clinicName}</strong>
          </p>
        </div>
      </div>
    `,
  });
};

const sendInvoiceEmail = async ({
  to,
  clinicName = "Khoury Dental Art",
  patientName,
  treatmentType,
  amount,
  invoiceId,
}) => {
  return sendEmail({
    to,
    subject: `${clinicName} - Invoice`,
    html: `
      <div style="
        max-width: 620px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        color: #1f2937;
        background: #ffffff;
      ">
        <div style="
          background: #0f9da5;
          padding: 24px;
          text-align: center;
          color: #ffffff;
        ">
          <h1 style="margin: 0; font-size: 24px;">
            ${clinicName}
          </h1>

          <p style="margin: 8px 0 0;">
            Invoice
          </p>
        </div>

        <div style="padding: 30px;">
          <h2 style="margin-top: 0; color: #172d3a;">
            Hello ${patientName},
          </h2>

          <p style="line-height: 1.6;">
            Your invoice for the completed dental treatment is ready.
          </p>

          <div style="
            margin: 24px 0;
            padding: 20px;
            background: #f4f9fa;
            border-radius: 10px;
          ">
            <p style="margin: 8px 0;">
              <strong>Treatment:</strong>
              ${treatmentType}
            </p>

            <p style="margin: 8px 0;">
              <strong>Amount:</strong>
              ₪${Number(amount || 0).toFixed(2)}
            </p>

            <p style="margin: 8px 0;">
              <strong>Invoice ID:</strong>
              #${invoiceId}
            </p>
          </div>

          <p style="margin-top: 28px;">
            Thank you for choosing
            <strong>${clinicName}</strong>.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail,
  sendInvoiceEmail,
};
