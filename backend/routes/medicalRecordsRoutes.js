const express = require("express");
const router = express.Router();

const {
  getMedicalRecordByPatient,
  createOrUpdateMedicalRecord,
} = require("../controllers/medicalRecordsController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get(
  "/patient/:patientId",
  protect,
  allowRoles("patient", "doctor", "manager"),
  getMedicalRecordByPatient,
);

router.post(
  "/patient/:patientId",
  protect,
  allowRoles("doctor", "manager"),
  createOrUpdateMedicalRecord,
);

module.exports = router;
