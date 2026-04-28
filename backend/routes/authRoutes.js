const express = require("express");
const router = express.Router();

const { login, registerPatient } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", registerPatient);

module.exports = router;
