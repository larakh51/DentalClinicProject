import { useEffect, useState } from "react";
import { CheckCircle, Clock3, DollarSign, Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerFinance.module.css";

const INVOICES_PER_PAGE = 7;

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function ManagerFinance() {
  const { user } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    collected: 0,
    pending: 0,
  });

  const [error, setError] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    date: "",
  });

  const [paymentError, setPaymentError] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const loadFinanceData = async () => {
    try {
      const [invoicesRes, statsRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/invoices/finance-stats"),
      ]);

      setInvoices(invoicesRes.data || []);
      setStats(statsRes.data || {});
      setError("");
    } catch (err) {
      console.log("Failed to load finance data", err.response?.data || err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load finance data",
      );
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);

    setPaymentForm({
      amount: "",
      paymentMethod: "cash",
      date: getTodayDate(),
    });

    setPaymentError("");
  };

  const closePaymentModal = () => {
    if (savingPayment) return;

    setSelectedInvoice(null);
    setPaymentError("");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInvoice) return;

    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      setPaymentError("Enter a valid payment amount");
      return;
    }

    setSavingPayment(true);
    setPaymentError("");

    try {
      await api.post(`/invoices/${selectedInvoice.id}/payments`, {
        patientId: selectedInvoice.patient_id,
        amount,
        paymentMethod: paymentForm.paymentMethod,
        date: paymentForm.date,
      });

      await loadFinanceData();

      setSelectedInvoice(null);
    } catch (err) {
      console.log("Failed to save payment", err.response?.data || err);

      setPaymentError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to save payment",
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const search = searchTerm.toLowerCase();

    const invoiceId = String(invoice.id || "").toLowerCase();
    const patientName = String(invoice.patient_name || "").toLowerCase();
    const date = formatDate(invoice.date).toLowerCase();
    const amount = String(invoice.amount || "").toLowerCase();
    const status = String(invoice.status || "").toLowerCase();

    return (
      invoiceId.includes(search) ||
      patientName.includes(search) ||
      date.includes(search) ||
      amount.includes(search) ||
      status.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE);

  const firstInvoiceIndex = (currentPage - 1) * INVOICES_PER_PAGE;
  const lastInvoiceIndex = firstInvoiceIndex + INVOICES_PER_PAGE;

  const paginatedInvoices = filteredInvoices.slice(
    firstInvoiceIndex,
    lastInvoiceIndex,
  );

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.userCircle}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.pageHeader}>
            <h1>Financial Management</h1>
            <p>Revenue and payment tracking</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Total Revenue</h3>
                <DollarSign size={18} className={styles.greenIcon} />
              </div>

              <strong className={styles.greenText}>
                ₪{stats.totalRevenue || 0}
              </strong>
              <p>All time</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Collected</h3>
                <CheckCircle size={18} className={styles.greenIcon} />
              </div>

              <strong className={styles.greenText}>
                ₪{stats.collected || 0}
              </strong>
              <p>Paid invoices</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Pending</h3>
                <Clock3 size={18} className={styles.orangeIcon} />
              </div>

              <strong className={styles.orangeText}>
                ₪{stats.pending || 0}
              </strong>
              <p>To be collected</p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>All Invoices</h2>
                <p>Complete payment history</p>
              </div>
            </div>

            <div className={styles.searchBox}>
              <Search size={19} />

              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Invoice ID</span>
                <span>Patient</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              {filteredInvoices.length === 0 ? (
                <div className={styles.emptyBox}>No invoices found</div>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <div className={styles.tableRow} key={invoice.id}>
                    <strong>#{invoice.id}</strong>

                    <span>{invoice.patient_name || "Unknown patient"}</span>

                    <span>{formatDate(invoice.date)}</span>

                    <span>₪{invoice.amount}</span>

                    <div className={styles.statusCell}>
                      <span
                        className={`${styles.status} ${
                          styles[invoice.status] || ""
                        }`}
                      >
                        {invoice.status}
                      </span>

                      {invoice.status !== "paid" &&
                        invoice.status !== "cancelled" && (
                          <button
                            type="button"
                            className={styles.paymentButton}
                            onClick={() => openPaymentModal(invoice)}
                          >
                            Record Payment
                          </button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.paginationArrow}
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        currentPage === pageNumber
                          ? `${styles.pageButton} ${styles.activePage}`
                          : styles.pageButton
                      }
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className={styles.paginationArrow}
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  ›
                </button>
              </div>
            )}
          </section>

          {selectedInvoice && (
            <div className={styles.modalOverlay} onClick={closePaymentModal}>
              <div
                className={styles.paymentModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div>
                    <h2>Record Payment</h2>
                    <p>
                      Invoice #{selectedInvoice.id} —{" "}
                      {selectedInvoice.patient_name}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={closePaymentModal}
                    disabled={savingPayment}
                  >
                    ×
                  </button>
                </div>

                {paymentError && (
                  <div className={styles.paymentError}>{paymentError}</div>
                )}

                <form
                  className={styles.paymentForm}
                  onSubmit={handlePaymentSubmit}
                >
                  <label>
                    Invoice Amount
                    <input
                      type="text"
                      value={`₪${selectedInvoice.amount}`}
                      disabled
                    />
                  </label>

                  <label>
                    Payment Amount
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label>
                    Payment Method
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </label>

                  <label>
                    Payment Date
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={closePaymentModal}
                      disabled={savingPayment}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className={styles.savePaymentButton}
                      disabled={savingPayment}
                    >
                      {savingPayment ? "Saving..." : "Save Payment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManagerFinance;
