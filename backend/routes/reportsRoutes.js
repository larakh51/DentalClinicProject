const express = require("express");
const router = express.Router();

const { getManagerReports } = require("../controllers/reportsController");
const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/manager", protect, allowRoles("manager"), getManagerReports);

module.exports = router;
