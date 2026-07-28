const express = require("express");
const router = express.Router();
const { protect } = require("../middleWares/authMiddleware");

const {
  getAppointments,
  getDoctorAppointmentCounts,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentsController");

router.get("/doctor-counts", getDoctorAppointmentCounts);

router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);

router.patch("/:id/status", protect, updateAppointmentStatus);

module.exports = router;
