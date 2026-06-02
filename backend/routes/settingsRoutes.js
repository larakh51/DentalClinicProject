const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
  getTreatmentTypes,
  createTreatmentType,
} = require("../controllers/settingsController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/", protect, allowRoles("manager"), getSettings);
router.put("/", protect, allowRoles("manager"), updateSettings);

router.get("/treatment-types", protect, getTreatmentTypes);
router.post(
  "/treatment-types",
  protect,
  allowRoles("manager"),
  createTreatmentType,
);

module.exports = router;
