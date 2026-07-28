const express = require("express");
const router = express.Router();

const {
  getInvoices,
  getFinanceStats,
  getInvoiceById,
  createInvoice,
  getOrCreateAppointmentInvoice,
  updateInvoiceStatus,
  createPayment,
  getPaymentsByPatient,
} = require("../controllers/invoicesController");

const { protect, allowRoles } = require("../middleWares/authMiddleware");

router.get("/", protect, getInvoices);

router.post("/", protect, allowRoles("manager", "doctor"), createInvoice);

router.get("/finance-stats", protect, allowRoles("manager"), getFinanceStats);

router.get("/payments/patient/:patientId", protect, getPaymentsByPatient);
router.post(
  "/appointment/:appointmentId",
  protect,
  allowRoles("manager", "doctor"),
  getOrCreateAppointmentInvoice,
);

router.get("/:id", protect, getInvoiceById);

router.patch(
  "/:id/status",
  protect,
  allowRoles("manager"),
  updateInvoiceStatus,
);

router.post(
  "/:id/payments",
  protect,
  allowRoles("manager", "doctor"),
  createPayment,
);

module.exports = router;
