import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock3,
  AlertCircle,
  Download,
  CreditCard,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./payments.module.css";

function Payments() {
  const { user } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user?.id) return;

      try {
        const res = await api.get(`/invoices?patientId=${user.id}`);
        setInvoices(res.data || []);
        setError("");
      } catch (err) {
        console.log("Failed to load invoices", err);
        setError("Failed to load invoices");
        setInvoices([]);
      }
    };

    loadInvoices();
  }, [user]);

  const getInvoiceStatus = (invoice) => {
    return String(invoice.status || "").toLowerCase();
  };

  const getInvoiceDescription = (invoice) => {
    return (
      invoice.description ||
      invoice.treatment_description ||
      invoice.treatment_type ||
      invoice.notes ||
      "Dental service"
    );
  };

  const paidInvoices = invoices.filter(
    (invoice) => getInvoiceStatus(invoice) === "paid",
  );

  const pendingInvoices = invoices.filter((invoice) => {
    const status = getInvoiceStatus(invoice);

    return status === "pending" || status === "unpaid" || status === "partial";
  });

  const overdueInvoices = invoices.filter(
    (invoice) => getInvoiceStatus(invoice) === "overdue",
  );

  const totalPaid = paidInvoices.reduce((sum, invoice) => {
    return sum + Number(invoice.amount || 0);
  }, 0);

  const totalPending = pendingInvoices.reduce((sum, invoice) => {
    return sum + Number(invoice.amount || 0);
  }, 0);

  const totalOverdue = overdueInvoices.reduce((sum, invoice) => {
    return sum + Number(invoice.amount || 0);
  }, 0);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const handleDownloadInvoice = (invoice) => {
    const invoiceContent = `
Dental Clinic Invoice

Invoice ID: #${invoice.id}
Patient: ${user?.firstName || ""} ${user?.lastName || ""}
Date: ${formatDate(invoice.date)}
Description: ${getInvoiceDescription(invoice)}
Amount: ₪${invoice.amount}
Status: ${invoice.status}

Thank you for choosing Dental Clinic.
`;

    const blob = new Blob([invoiceContent], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `invoice-${invoice.id}.txt`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <h1>Payments & Invoices</h1>
            <p>View and manage your payment history</p>
          </div>

          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Total Paid</h3>
                <CheckCircle size={18} className={styles.greenIcon} />
              </div>

              <strong className={styles.greenAmount}>₪{totalPaid}</strong>
              <p>All time</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Pending</h3>
                <Clock3 size={18} className={styles.orangeIcon} />
              </div>

              <strong className={styles.orangeAmount}>₪{totalPending}</strong>
              <p>Awaiting payment</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Overdue</h3>
                <AlertCircle size={18} className={styles.redIcon} />
              </div>

              <strong className={styles.redAmount}>₪{totalOverdue}</strong>
              <p>Requires attention</p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Invoice History</h2>
              <p>All your payment records</p>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Invoice ID</span>
                <span>Date</span>
                <span>Description</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {invoices.length === 0 ? (
                <div className={styles.empty}>No invoices found</div>
              ) : (
                invoices.map((invoice) => {
                  const status = getInvoiceStatus(invoice);

                  return (
                    <div className={styles.tableRow} key={invoice.id}>
                      <span className={styles.invoiceId}>#{invoice.id}</span>
                      <span>{formatDate(invoice.date)}</span>
                      <span>{getInvoiceDescription(invoice)}</span>
                      <span>₪{invoice.amount}</span>

                      <span
                        className={`${styles.status} ${styles[status] || ""}`}
                      >
                        {invoice.status}
                      </span>

                      <button
                        type="button"
                        className={styles.downloadBtn}
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download size={17} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className={styles.methodsCard}>
            <h2>Payment Methods Accepted</h2>

            <div className={styles.methods}>
              <div>
                <CreditCard size={17} />
                <span>Credit/Debit Cards</span>
              </div>

              <div>
                <CreditCard size={17} />
                <span>Bank Transfer</span>
              </div>

              <div>
                <CreditCard size={17} />
                <span>Insurance Claims</span>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Payments;
