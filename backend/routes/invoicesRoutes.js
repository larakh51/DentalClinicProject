const express = require("express");
const router = express.Router();

const {
  getInvoices,
  getFinanceStats,
  getInvoiceById,
  updateInvoiceStatus,
  createPayment,
  getPaymentsByPatient,
} = require("../controllers/invoicesController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/", protect, getInvoices);

router.get("/finance-stats", protect, allowRoles("manager"), getFinanceStats);

router.get("/payments/patient/:patientId", protect, getPaymentsByPatient);

router.get("/:id", protect, getInvoiceById);

router.patch(
  "/:id/status",
  protect,
  allowRoles("manager"),
  updateInvoiceStatus,
);

router.post("/:id/payments", protect, allowRoles("manager"), createPayment);

module.exports = router;
