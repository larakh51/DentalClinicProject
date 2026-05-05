const express = require("express");
const router = express.Router();

const {
  login,
  registerPatient,
  getMe,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleWares/authMiddleware");

router.post("/login", login);
router.post("/register", registerPatient);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
