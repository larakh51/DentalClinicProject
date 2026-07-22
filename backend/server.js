const path = require("path");
const reportsRoutes = require("./routes/reportsRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
  override: true,
});

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const appointmentsRoutes = require("./routes/appointmentsRoutes");
const treatmentsRoutes = require("./routes/treatmentsRoutes");
const invoicesRoutes = require("./routes/invoicesRoutes");
const medicalRecordsRoutes = require("./routes/medicalRecordsRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  session({
    name: "clinic_session",
    secret: process.env.SESSION_SECRET || "clinic_default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/treatments", treatmentsRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/medical-records", medicalRecordsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/availability", availabilityRoutes);

app.get("/", (req, res) => {
  res.send("Dental Clinic API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
