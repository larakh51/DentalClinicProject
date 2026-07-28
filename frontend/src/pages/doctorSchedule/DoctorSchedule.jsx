import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorSchedule.module.css";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function DoctorSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState("calendar");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    date: "",
  });

  useEffect(() => {
    const loadSchedule = async () => {
      if (!user?.id) return;

      try {
        const res = await api.get(`/appointments?doctorId=${user.id}`);
        setAppointments(res.data || []);
      } catch (error) {
        console.log("Failed to load doctor schedule", error);

        setAppointments([
          {
            id: "a1",
            date: "2026-02-10",
            time: "11:30",
            patient_name: "Tamar Weiss",
            treatment_type: "Whitening",
            status: "completed",
          },
          {
            id: "a2",
            date: "2026-03-16",
            time: "15:00",
            patient_name: "Yael Friedman",
            treatment_type: "Consultation",
            status: "completed",
          },
          {
            id: "a3",
            date: "2026-03-20",
            time: "09:00",
            patient_name: "Michael Rosenberg",
            treatment_type: "Consultation",
            status: "completed",
          },
          {
            id: "a4",
            date: "2026-03-21",
            time: "11:00",
            patient_name: "Rina Shalev",
            treatment_type: "Filling",
            status: "completed",
          },
          {
            id: "a5",
            date: "2026-03-26",
            time: "10:00",
            patient_name: "Sarah Cohen",
            treatment_type: "Cleaning & Check-up",
            status: "confirmed",
          },
          {
            id: "a6",
            date: "2026-03-26",
            time: "14:00",
            patient_name: "Michael Rosenberg",
            treatment_type: "Root Canal",
            status: "scheduled",
          },
          {
            id: "a7",
            date: "2026-03-27",
            time: "10:30",
            patient_name: "Noa Shapiro",
            treatment_type: "Orthodontic Consultation",
            status: "scheduled",
          },
          {
            id: "a8",
            date: "2026-03-28",
            time: "11:00",
            patient_name: "Avi Mizrahi",
            treatment_type: "Emergency - Toothache",
            status: "confirmed",
          },
          {
            id: "a9",
            date: "2026-03-30",
            time: "10:00",
            patient_name: "Amir Peretz",
            treatment_type: "Cleaning & Check-up",
            status: "scheduled",
          },
        ]);
      }
    };

    loadSchedule();
  }, [user]);

  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = appointment.date;

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(appointment);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedAppointments).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateDifference = new Date(a.date) - new Date(b.date);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return String(a.time || "").localeCompare(String(b.time || ""));
  });

  const formatFullDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatListDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingStatusId(appointmentId);

    try {
      await api.patch(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: newStatus,
              }
            : appointment,
        ),
      );
    } catch (error) {
      console.log(
        "Failed to update appointment status",
        error.response?.data || error,
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const openPaymentModal = async (appointment) => {
    if (!appointment.patient_id) {
      window.alert("Patient ID is missing from appointment data");
      return;
    }

    setLoadingPaymentId(appointment.id);

    try {
      const res = await api.post(`/invoices/appointment/${appointment.id}`);

      const invoice = res.data?.invoice;

      if (!invoice) {
        window.alert("Failed to prepare treatment invoice");
        return;
      }

      const remainingAmount = Number(
        invoice.remaining_amount ?? invoice.amount ?? 0,
      );

      if (
        String(invoice.status || "").toLowerCase() === "paid" ||
        remainingAmount <= 0
      ) {
        window.alert("This treatment is already fully paid");
        return;
      }

      setSelectedInvoice(invoice);

      setPaymentForm({
        amount: "",
        paymentMethod: "cash",
        date: getTodayDate(),
      });

      setPaymentError("");
    } catch (error) {
      console.log(
        "Failed to prepare treatment invoice",
        error.response?.data || error,
      );

      window.alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to prepare treatment invoice",
      );
    } finally {
      setLoadingPaymentId(null);
    }
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

    const remainingAmount = Number(
      selectedInvoice.remaining_amount ?? selectedInvoice.amount ?? 0,
    );

    if (!amount || amount <= 0) {
      setPaymentError("Enter a valid payment amount");
      return;
    }

    if (amount > remainingAmount) {
      setPaymentError(
        `Payment amount cannot exceed ₪${remainingAmount.toFixed(2)}`,
      );
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

      setSelectedInvoice(null);
    } catch (error) {
      console.log("Failed to save payment", error.response?.data || error);

      setPaymentError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to save payment",
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const renderAppointmentActions = (appointment) => (
    <div className={styles.appointmentActions}>
      <select
        className={`${styles.status} ${styles[appointment.status] || ""}`}
        value={appointment.status}
        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
        disabled={updatingStatusId === appointment.id}
      >
        <option value="scheduled">scheduled</option>
        <option value="confirmed">confirmed</option>
        <option value="completed">completed</option>
        <option value="cancelled">cancelled</option>
      </select>

      {String(appointment.status || "").toLowerCase() === "completed" && (
        <button
          type="button"
          className={styles.paymentButton}
          onClick={() => openPaymentModal(appointment)}
          disabled={loadingPaymentId === appointment.id}
        >
          {loadingPaymentId === appointment.id
            ? "Loading..."
            : "Record Payment"}
        </button>
      )}
    </div>
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
          <div className={styles.headerRow}>
            <div className={styles.pageHeader}>
              <h1>My Schedule</h1>
              <p>View your appointment calendar</p>
            </div>

            <button
              type="button"
              className={styles.newBtn}
              onClick={() => navigate("/doctor-book-appointment")}
            >
              <CalendarDays size={17} />
              New Appointment
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              className={
                viewMode === "calendar"
                  ? `${styles.tab} ${styles.activeTab}`
                  : styles.tab
              }
              onClick={() => setViewMode("calendar")}
            >
              Calendar View
            </button>

            <button
              className={
                viewMode === "list"
                  ? `${styles.tab} ${styles.activeTab}`
                  : styles.tab
              }
              onClick={() => setViewMode("list")}
            >
              List View
            </button>
          </div>

          {viewMode === "calendar" ? (
            <div className={styles.scheduleList}>
              {sortedDates.map((date) => (
                <section className={styles.dateCard} key={date}>
                  <div className={styles.dateHeader}>
                    <div className={styles.dateTitle}>
                      <CalendarDays size={21} />
                      <h2>{formatFullDate(date)}</h2>
                    </div>

                    <p>
                      {groupedAppointments[date].length} appointment
                      {groupedAppointments[date].length > 1 ? "s" : ""}(s)
                    </p>
                  </div>

                  <div className={styles.appointmentList}>
                    {groupedAppointments[date].map((appointment) => (
                      <div
                        className={styles.appointmentItem}
                        key={appointment.id}
                      >
                        <div className={styles.timeBox}>{appointment.time}</div>

                        <div className={styles.appointmentInfo}>
                          <div className={styles.nameRow}>
                            <h3>{appointment.patient_name}</h3>
                            {renderAppointmentActions(appointment)}
                          </div>

                          <p>{appointment.treatment_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className={styles.scheduleList}>
              <section className={styles.dateCard}>
                <div className={styles.appointmentList}>
                  {sortedAppointments.map((appointment) => (
                    <div
                      className={styles.appointmentItem}
                      key={appointment.id}
                    >
                      <div className={styles.listDateTimeBox}>
                        <strong>{formatListDate(appointment.date)}</strong>
                        <span>{appointment.time}</span>
                      </div>

                      <div className={styles.appointmentInfo}>
                        <div className={styles.nameRow}>
                          <h3>{appointment.patient_name}</h3>
                          {renderAppointmentActions(appointment)}
                        </div>

                        <p>{appointment.treatment_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

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
                      {selectedInvoice.patient_name} —{" "}
                      {selectedInvoice.treatment_type}
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
                    Treatment Price
                    <input
                      type="text"
                      value={`₪${Number(selectedInvoice.amount || 0).toFixed(
                        2,
                      )}`}
                      disabled
                    />
                  </label>

                  <label>
                    Payment Amount
                    <input
                      type="number"
                      min="0.01"
                      max={Number(
                        selectedInvoice.remaining_amount ??
                          selectedInvoice.amount ??
                          0,
                      )}
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

export default DoctorSchedule;
