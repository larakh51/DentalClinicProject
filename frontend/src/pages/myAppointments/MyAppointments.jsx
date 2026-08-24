import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, UserRound, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import AppModal from "../../components/appModal/AppModal";
import styles from "./myAppointments.module.css";

const APPOINTMENTS_PER_PAGE = 5;

function MyAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");

  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);

  const loadAppointments = async () => {
    if (!user?.id) return;

    try {
      const res = await api.get(`/appointments?patientId=${user.id}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.log("Failed to load appointments", err);
      setError("Failed to load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const openCancelModal = (id) => {
    setCancelAppointmentId(id);
  };

  const closeCancelModal = () => {
    setCancelAppointmentId(null);
  };

  const cancelAppointment = async () => {
    const id = cancelAppointmentId;

    if (!id) return;

    setCancelAppointmentId(null);

    try {
      await api.patch(`/appointments/${id}/status`, {
        status: "cancelled",
      });

      loadAppointments();
    } catch (err) {
      console.log("Failed to cancel appointment", err);

      setError(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const upcomingAppointments = appointments.filter(
    (item) => item.status !== "completed" && item.status !== "cancelled",
  );

  const completedAppointments = appointments.filter(
    (item) => item.status === "completed",
  );

  const cancelledAppointments = appointments.filter(
    (item) => item.status === "cancelled",
  );

  const appointmentsToShow =
    activeTab === "upcoming"
      ? upcomingAppointments
      : activeTab === "completed"
        ? completedAppointments
        : cancelledAppointments;

  const totalPages = Math.ceil(
    appointmentsToShow.length / APPOINTMENTS_PER_PAGE,
  );

  const firstAppointmentIndex = (currentPage - 1) * APPOINTMENTS_PER_PAGE;

  const lastAppointmentIndex = firstAppointmentIndex + APPOINTMENTS_PER_PAGE;

  const paginatedAppointments = appointmentsToShow.slice(
    firstAppointmentIndex,
    lastAppointmentIndex,
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
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
            <div>
              <h1>My Appointments</h1>
              <p>View and manage your dental appointments</p>
            </div>

            <button
              className={styles.bookBtn}
              onClick={() => navigate("/book-appointment")}
            >
              <CalendarDays size={17} />
              Book New
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              className={
                activeTab === "upcoming"
                  ? `${styles.tab} ${styles.activeTab}`
                  : styles.tab
              }
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming ({upcomingAppointments.length})
            </button>

            <button
              className={
                activeTab === "completed"
                  ? `${styles.tab} ${styles.activeTab}`
                  : styles.tab
              }
              onClick={() => setActiveTab("completed")}
            >
              Completed ({completedAppointments.length})
            </button>

            <button
              className={
                activeTab === "cancelled"
                  ? `${styles.tab} ${styles.activeTab}`
                  : styles.tab
              }
              onClick={() => setActiveTab("cancelled")}
            >
              Cancelled ({cancelledAppointments.length})
            </button>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.appointmentsList}>
            {appointmentsToShow.length === 0 ? (
              <div className={styles.emptyCard}>No appointments found</div>
            ) : (
              paginatedAppointments.map((appointment) => (
                <div className={styles.appointmentCard} key={appointment.id}>
                  <div className={styles.cardTop}>
                    <div className={styles.titleRow}>
                      <h2>{appointment.treatment_type}</h2>

                      <span
                        className={`${styles.status} ${
                          styles[appointment.status] || ""
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    {appointment.status !== "cancelled" &&
                      appointment.status !== "completed" && (
                        <button
                          className={styles.cancelIcon}
                          onClick={() => openCancelModal(appointment.id)}
                          title="Cancel appointment"
                        >
                          <X size={18} />
                        </button>
                      )}
                  </div>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <UserRound size={17} />
                      <span>{appointment.doctor_name}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <CalendarDays size={17} />
                      <span>{formatDate(appointment.date)}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <Clock3 size={17} />
                      <span>{appointment.time}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <MapPin size={17} />
                      <span>Main Clinic</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className={styles.notes}>
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
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
        </section>
      </main>

      <AppModal
        open={Boolean(cancelAppointmentId)}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Yes, Cancel"
        cancelText="Keep Appointment"
        showCancel
        danger
        onConfirm={cancelAppointment}
        onCancel={closeCancelModal}
      />
    </div>
  );
}

export default MyAppointments;
