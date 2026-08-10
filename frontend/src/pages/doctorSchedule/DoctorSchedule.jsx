import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Filter, Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import AppModal from "../../components/appModal/AppModal";
import styles from "./doctorSchedule.module.css";

const APPOINTMENTS_PER_PAGE = 7;

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
  const [statusRequests, setStatusRequests] = useState({});
  const [scheduleError, setScheduleError] = useState("");
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [cancelModal, setCancelModal] = useState({
    appointmentId: null,
  });

  const [messageModal, setMessageModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    date: "",
  });

  const showMessage = (title, message) => {
    setMessageModal({
      open: true,
      title,
      message,
    });
  };

  const closeMessageModal = () => {
    setMessageModal({
      open: false,
      title: "",
      message: "",
    });
  };

  const loadSchedule = async () => {
    if (!user?.id) return;

    setLoadingSchedule(true);
    setScheduleError("");

    try {
      const res = await api.get(`/appointments?doctorId=${user.id}`);
      setAppointments(res.data || []);
    } catch (error) {
      console.log("Failed to load doctor schedule", error);
      setAppointments([]);
      setScheduleError("Failed to load doctor schedule");
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return undefined;

    let isActive = true;

    api
      .get(`/appointments?doctorId=${user.id}`)
      .then((res) => {
        if (!isActive) return;

        setAppointments(res.data || []);
        setScheduleError("");
      })
      .catch((error) => {
        if (!isActive) return;

        console.log("Failed to load doctor schedule", error);
        setAppointments([]);
        setScheduleError("Failed to load doctor schedule");
      });

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const formatInputDate = (date) => {
    if (!date) return "";

    const dateValue = String(date);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const search = searchTerm.toLowerCase();

    const patientName = String(appointment.patient_name || "").toLowerCase();
    const doctorName = String(appointment.doctor_name || "").toLowerCase();
    const treatment = String(appointment.treatment_type || "").toLowerCase();
    const status = String(appointment.status || "").toLowerCase();

    const appointmentDate = formatInputDate(appointment.date);

    if (status === "completed") {
      return false;
    }

    const matchesSearch =
      patientName.includes(search) ||
      doctorName.includes(search) ||
      treatment.includes(search) ||
      status.includes(search);

    const matchesStatus =
      statusFilter === "all" || status === statusFilter.toLowerCase();

    const matchesDate = !dateFilter || appointmentDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedFilteredAppointments = [...filteredAppointments].sort((a, b) => {
    const aDate = formatInputDate(a.date);
    const bDate = formatInputDate(b.date);

    const aDateTime = new Date(
      `${aDate}T${String(a.time || "00:00").slice(0, 8)}`,
    );

    const bDateTime = new Date(
      `${bDate}T${String(b.time || "00:00").slice(0, 8)}`,
    );

    return aDateTime - bDateTime;
  });

  const totalPages = Math.ceil(
    sortedFilteredAppointments.length / APPOINTMENTS_PER_PAGE,
  );

  const firstAppointmentIndex = (currentPage - 1) * APPOINTMENTS_PER_PAGE;

  const lastAppointmentIndex = firstAppointmentIndex + APPOINTMENTS_PER_PAGE;

  const paginatedAppointments = sortedFilteredAppointments.slice(
    firstAppointmentIndex,
    lastAppointmentIndex,
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const groupedAppointments = paginatedAppointments.reduce(
    (groups, appointment) => {
      const date = appointment.date;

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(appointment);

      return groups;
    },
    {},
  );

  const sortedDates = Object.keys(groupedAppointments).sort(
    (a, b) => new Date(a) - new Date(b),
  );

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

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("");
  };

  const updateStatusRequest = (appointmentId, values) => {
    setStatusRequests((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        ...values,
      },
    }));
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    updateStatusRequest(appointmentId, {
      saving: true,
      error: "",
    });

    try {
      const res = await api.patch(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });

      const confirmedStatus = res.data?.appointment?.status;

      if (!confirmedStatus) {
        throw new Error("Status response is missing the appointment");
      }

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: confirmedStatus,
              }
            : appointment,
        ),
      );
    } catch (error) {
      console.log(
        "Failed to update appointment status",
        error.response?.data || error,
      );

      updateStatusRequest(appointmentId, {
        error:
          error.response?.data?.message ||
          "Failed to update appointment status",
      });
    } finally {
      updateStatusRequest(appointmentId, {
        saving: false,
      });
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    if (newStatus === "cancelled") {
      setCancelModal({
        appointmentId,
      });

      return;
    }

    await updateAppointmentStatus(appointmentId, newStatus);
  };

  const confirmCancelAppointment = async () => {
    const appointmentId = cancelModal.appointmentId;

    if (!appointmentId) return;

    await updateAppointmentStatus(appointmentId, "cancelled");

    setCancelModal({
      appointmentId: null,
    });
  };

  const closeCancelModal = () => {
    setCancelModal({
      appointmentId: null,
    });
  };

  const openPaymentModal = async (appointment) => {
    if (!appointment.patient_id) {
      showMessage(
        "Payment unavailable",
        "Patient ID is missing from appointment data",
      );

      return;
    }

    setLoadingPaymentId(appointment.id);

    try {
      const res = await api.post(`/invoices/appointment/${appointment.id}`);

      const invoice = res.data?.invoice;

      if (!invoice) {
        showMessage(
          "Payment unavailable",
          "Failed to prepare treatment invoice",
        );

        return;
      }

      const remainingAmount = Number(
        invoice.remaining_amount ?? invoice.amount ?? 0,
      );

      if (
        String(invoice.status || "").toLowerCase() === "paid" ||
        remainingAmount <= 0
      ) {
        showMessage("Payment complete", "This treatment is already fully paid");

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

      showMessage(
        "Payment unavailable",
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

  const canCompleteAppointment = (appointment) => {
    if (!appointment?.date || !appointment?.time) {
      return false;
    }

    const appointmentDate = String(appointment.date).split("T")[0];
    const appointmentTime = String(appointment.time).slice(0, 8);

    const appointmentDateTime = new Date(
      `${appointmentDate}T${appointmentTime}`,
    );

    if (Number.isNaN(appointmentDateTime.getTime())) {
      return false;
    }

    return appointmentDateTime <= new Date();
  };

  const renderAppointmentActions = (appointment) => {
    const requestState = statusRequests[appointment.id] || {};

    const statusErrorId = `appointment-status-error-${appointment.id}`;

    const isCompleted =
      String(appointment.status || "").toLowerCase() === "completed";

    return (
      <div className={styles.appointmentActions}>
        <div className={styles.statusControl}>
          <select
            className={`${styles.status} ${styles[appointment.status] || ""}`}
            value={appointment.status}
            onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
            disabled={requestState.saving || isCompleted}
            aria-describedby={requestState.error ? statusErrorId : undefined}
          >
            <option value="scheduled">scheduled</option>
            <option value="confirmed">confirmed</option>

            <option
              value="completed"
              disabled={!isCompleted && !canCompleteAppointment(appointment)}
            >
              completed
            </option>

            <option value="cancelled">cancelled</option>
          </select>

          {requestState.saving && (
            <span className={styles.statusSaving}>Saving...</span>
          )}

          {requestState.error && (
            <span
              className={styles.statusError}
              id={statusErrorId}
              role="alert"
            >
              {requestState.error}
            </span>
          )}
        </div>

        {isCompleted && (
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

          <div className={styles.scheduleToolbar}>
            <div className={styles.searchBox}>
              <Search size={19} />

              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.filterBtn}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter size={17} />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className={styles.filterPanel}>
              <div className={styles.filterField}>
                <label>Status</label>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className={styles.filterField}>
                <label>Date</label>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <button
                type="button"
                className={styles.clearFilterBtn}
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          )}

          {scheduleError && (
            <div className={styles.scheduleError} role="alert">
              <p>{scheduleError}</p>

              <button
                type="button"
                className={styles.retryButton}
                onClick={loadSchedule}
                disabled={loadingSchedule}
              >
                {loadingSchedule ? "Retrying..." : "Retry"}
              </button>
            </div>
          )}

          {!scheduleError &&
            (filteredAppointments.length === 0 ? (
              <div className={styles.emptyBox}>No appointments found</div>
            ) : viewMode === "calendar" ? (
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
                        {groupedAppointments[date].length > 1 ? "s" : ""}
                        (s)
                      </p>
                    </div>

                    <div className={styles.appointmentList}>
                      {groupedAppointments[date].map((appointment) => (
                        <div
                          className={styles.appointmentItem}
                          key={appointment.id}
                        >
                          <div className={styles.timeBox}>
                            {appointment.time}
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
                ))}
              </div>
            ) : (
              <div className={styles.scheduleList}>
                <section className={styles.dateCard}>
                  <div className={styles.appointmentList}>
                    {paginatedAppointments.map((appointment) => (
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
            ))}

          {totalPages > 1 && !scheduleError && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationArrow}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

      <AppModal
        open={Boolean(cancelModal.appointmentId)}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Yes, Cancel"
        cancelText="Keep Appointment"
        showCancel
        danger
        loading={
          Boolean(cancelModal.appointmentId) &&
          Boolean(statusRequests[cancelModal.appointmentId]?.saving)
        }
        onConfirm={confirmCancelAppointment}
        onCancel={closeCancelModal}
      />

      <AppModal
        open={messageModal.open}
        title={messageModal.title}
        message={messageModal.message}
        confirmText="OK"
        onConfirm={closeMessageModal}
        onCancel={closeMessageModal}
      />
    </div>
  );
}

export default DoctorSchedule;
