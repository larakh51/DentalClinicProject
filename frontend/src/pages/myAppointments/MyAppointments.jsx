import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, UserRound, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./myAppointments.module.css";

function MyAppointments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [error, setError] = useState("");

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

  const cancelAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/status`, {
        status: "cancelled",
      });

      loadAppointments();
    } catch (err) {
      console.log("Failed to cancel appointment", err);
      setError("Failed to cancel appointment");
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
              appointmentsToShow.map((appointment) => (
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
                          onClick={() => cancelAppointment(appointment.id)}
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
        </section>
      </main>
    </div>
  );
}

export default MyAppointments;
