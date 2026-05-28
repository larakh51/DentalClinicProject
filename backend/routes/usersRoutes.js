const express = require("express");
const router = express.Router();

const {
  getUsers,
  getDoctors,
  getPatientsForDoctor,
  createEmployee,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/", protect, allowRoles("manager"), getUsers);
router.get("/doctors", getDoctors);
router.get("/patients", getPatientsForDoctor);
router.post("/employees", protect, allowRoles("manager"), createEmployee);

router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, allowRoles("manager"), deleteUser);

module.exports = router;
