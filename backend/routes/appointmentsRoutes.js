const express = require("express");
const router = express.Router();
//
const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentsController");

router.get("/", getAppointments);
router.post("/", createAppointment);
router.patch("/:id/status", updateAppointmentStatus);

module.exports = router;
