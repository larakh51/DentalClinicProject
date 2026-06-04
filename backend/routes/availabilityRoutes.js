const express = require("express");
const router = express.Router();

const {
  getMyAvailability,
  updateMyAvailability,
  getMyTimeOff,
  createTimeOffRequest,
} = require("../controllers/availabilityController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/me", protect, allowRoles("doctor"), getMyAvailability);
router.put("/me", protect, allowRoles("doctor"), updateMyAvailability);

router.get("/time-off", protect, allowRoles("doctor"), getMyTimeOff);
router.post("/time-off", protect, allowRoles("doctor"), createTimeOffRequest);

module.exports = router;
