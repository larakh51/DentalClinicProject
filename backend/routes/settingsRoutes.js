const express = require("express");
const router = express.Router();

const {
  getSettings,
  getVatPercentage,
  updateSettings,
  getTreatmentTypes,
  createTreatmentType,
  updateTreatmentType,
  deleteTreatmentType,
} = require("../controllers/settingsController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/vat", protect, getVatPercentage);

router.get("/", protect, allowRoles("manager"), getSettings);
router.put("/", protect, allowRoles("manager"), updateSettings);

router.get("/treatment-types", protect, getTreatmentTypes);

router.post(
  "/treatment-types",
  protect,
  allowRoles("manager"),
  createTreatmentType,
);

router.put(
  "/treatment-types/:id",
  protect,
  allowRoles("manager"),
  updateTreatmentType,
);

router.delete(
  "/treatment-types/:id",
  protect,
  allowRoles("manager"),
  deleteTreatmentType,
);

module.exports = router;
