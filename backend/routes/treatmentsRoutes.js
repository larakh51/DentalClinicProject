const express = require("express");
const router = express.Router();

const {
  getTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} = require("../controllers/treatmentsController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/", protect, getTreatments);
router.get("/:id", protect, getTreatmentById);
router.post("/", protect, allowRoles("doctor", "manager"), createTreatment);
router.put("/:id", protect, allowRoles("doctor", "manager"), updateTreatment);
router.delete("/:id", protect, allowRoles("manager"), deleteTreatment);

module.exports = router;
