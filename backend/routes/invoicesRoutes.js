const express = require("express");
const router = express.Router();

const {
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  createPayment,
  getPaymentsByPatient,
} = require("../controllers/invoicesController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);
router.patch(
  "/:id/status",
  protect,
  allowRoles("manager"),
  updateInvoiceStatus,
);
router.post("/:id/payments", protect, allowRoles("manager"), createPayment);
router.get("/payments/patient/:patientId", protect, getPaymentsByPatient);

module.exports = router;
