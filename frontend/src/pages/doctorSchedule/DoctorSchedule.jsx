import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorSchedule.module.css";

function DoctorSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState("calendar");

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

  const formatFullDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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

                          <span
                            className={`${styles.status} ${
                              styles[appointment.status] || ""
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <p>{appointment.treatment_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default DoctorSchedule;
