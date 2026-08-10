import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock3,
  AlertCircle,
  Download,
  CreditCard,
} from "lucide-react";
import { jsPDF } from "jspdf";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import clinicLogo from "../../assets/khoury-dental-logo.png.png";
import styles from "./payments.module.css";

const INVOICES_PER_PAGE = 7;

function Payments() {
  const { user } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.ceil(invoices.length / INVOICES_PER_PAGE);

  const firstInvoiceIndex = (currentPage - 1) * INVOICES_PER_PAGE;
  const lastInvoiceIndex = firstInvoiceIndex + INVOICES_PER_PAGE;

  const paginatedInvoices = invoices.slice(firstInvoiceIndex, lastInvoiceIndex);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const loadLogoImage = () => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = clinicLogo;
    });
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const primaryColor = [0, 145, 157];
      const darkColor = [23, 45, 58];
      const lightBackground = [244, 249, 250];
      const borderColor = [220, 227, 230];
      const grayText = [100, 110, 116];

      const invoiceAmount = Number(invoice.amount || 0).toFixed(2);

      const patientName =
        invoice.patient_name ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        "Patient";

      const description = getInvoiceDescription(invoice);

      const status = String(invoice.status || "unpaid").toUpperCase();

      doc.setProperties({
        title: `Invoice ${invoice.id}`,
        subject: "Dental Clinic Invoice",
        author: "Khoury Dental Art",
        creator: "Khoury Dental Art",
      });

      const logoImage = await loadLogoImage();

      doc.addImage(logoImage, "PNG", 15, 12, 62, 37);

      doc.setTextColor(...darkColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(27);
      doc.text("INVOICE", pageWidth - 15, 24, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...grayText);

      doc.text(`Invoice #${invoice.id}`, pageWidth - 15, 32, {
        align: "right",
      });

      doc.text(`Issued: ${formatDate(invoice.date)}`, pageWidth - 15, 38, {
        align: "right",
      });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.8);
      doc.line(15, 55, pageWidth - 15, 55);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text("BILL TO", 15, 70);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...darkColor);
      doc.text(patientName, 15, 79);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...grayText);
      doc.text("Patient", 15, 85);

      doc.setFillColor(...lightBackground);
      doc.setDrawColor(...borderColor);

      doc.roundedRect(pageWidth - 75, 67, 60, 21, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...grayText);
      doc.text("INVOICE STATUS", pageWidth - 70, 75);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...darkColor);
      doc.text(status, pageWidth - 70, 82);

      const tableTop = 105;

      doc.setFillColor(...primaryColor);
      doc.roundedRect(15, tableTop, pageWidth - 30, 12, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);

      doc.text("DESCRIPTION", 20, tableTop + 8);
      doc.text("DATE", 125, tableTop + 8);
      doc.text("AMOUNT", pageWidth - 20, tableTop + 8, {
        align: "right",
      });

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...borderColor);

      doc.roundedRect(15, tableTop + 15, pageWidth - 30, 25, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);

      const descriptionLines = doc.splitTextToSize(description, 90);

      doc.text(descriptionLines, 20, tableTop + 25);

      doc.text(formatDate(invoice.date), 125, tableTop + 25);

      doc.setFont("helvetica", "bold");

      doc.text(`ILS ${invoiceAmount}`, pageWidth - 20, tableTop + 25, {
        align: "right",
      });

      const summaryTop = tableTop + 58;

      doc.setFillColor(...lightBackground);
      doc.roundedRect(pageWidth - 90, summaryTop, 75, 38, 3, 3, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...grayText);

      doc.text("Subtotal", pageWidth - 84, summaryTop + 11);

      doc.setTextColor(...darkColor);

      doc.text(`ILS ${invoiceAmount}`, pageWidth - 21, summaryTop + 11, {
        align: "right",
      });

      doc.setDrawColor(...borderColor);
      doc.line(
        pageWidth - 84,
        summaryTop + 18,
        pageWidth - 21,
        summaryTop + 18,
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);

      doc.text("TOTAL", pageWidth - 84, summaryTop + 29);

      doc.text(`ILS ${invoiceAmount}`, pageWidth - 21, summaryTop + 29, {
        align: "right",
      });

      const thankYouTop = summaryTop + 60;

      doc.setDrawColor(...borderColor);
      doc.line(15, thankYouTop, pageWidth - 15, thankYouTop);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text(
        "Thank you for choosing Khoury Dental Art",
        pageWidth / 2,
        thankYouTop + 15,
        {
          align: "center",
        },
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...grayText);
      doc.text(
        "We appreciate your trust in our dental care.",
        pageWidth / 2,
        thankYouTop + 22,
        {
          align: "center",
        },
      );

      doc.setFillColor(...primaryColor);
      doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);

      doc.text(
        `Invoice #${invoice.id} | Khoury Dental Art`,
        pageWidth / 2,
        pageHeight - 5,
        {
          align: "center",
        },
      );

      doc.save(`Khoury-Dental-Invoice-${invoice.id}.pdf`);
    } catch (error) {
      console.log("Failed to generate invoice PDF", error);
      setError("Failed to generate invoice PDF");
    }
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
                paginatedInvoices.map((invoice) => {
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
                        title="Download PDF invoice"
                      >
                        <Download size={17} />
                      </button>
                    </div>
                  );
                })
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
        </section>
      </main>
    </div>
  );
}

export default Payments;
