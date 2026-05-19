import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle,
  UsersRound,
  Activity,
  Clock3,
  BriefcaseBusiness,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorDashboard.module.css";

function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadDoctorDashboard = async () => {
      if (!user?.id) return;

      try {
        const appointmentsRes = await api.get(
          `/appointments?doctorId=${user.id}`,
        );
        setAppointments(appointmentsRes.data || []);
      } catch (error) {
        console.log("Failed to load doctor appointments", error);

        setAppointments([
          {
            id: "a1",
            date: "2026-03-26",
            time: "10:00",
            patient_name: "Sarah Cohen",
            treatment_type: "Cleaning & Check-up",
            status: "confirmed",
          },
          {
            id: "a2",
            date: "2026-03-26",
            time: "14:00",
            patient_name: "Michael Rosenberg",
            treatment_type: "Root Canal",
            status: "scheduled",
          },
          {
            id: "a3",
            date: "2026-03-27",
            time: "10:30",
            patient_name: "Noa Shapiro",
            treatment_type: "Orthodontic Consultation",
            status: "scheduled",
          },
          {
            id: "a4",
            date: "2026-03-28",
            time: "11:00",
            patient_name: "Avi Mizrahi",
            treatment_type: "Emergency - Toothache",
            status: "confirmed",
          },
          {
            id: "a5",
            date: "2026-03-30",
            time: "10:00",
            patient_name: "Amir Peretz",
            treatment_type: "Cleaning & Check-up",
            status: "scheduled",
          },
        ]);
      }

      try {
        const patientsRes = await api.get(`/users?role=patient`);
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.log("Failed to load patients", error);
        setPatients(new Array(8).fill(null));
      }
    };

    loadDoctorDashboard();
  }, [user]);

  const today = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === today,
  );

  const completedToday = todayAppointments.filter(
    (appointment) => appointment.status === "completed",
  );

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "completed" && appointment.status !== "cancelled",
  );

  const confirmedToday = todayAppointments.filter(
    (appointment) => appointment.status === "confirmed",
  );

  const formatDateBadge = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

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
          <div className={styles.welcome}>
            <h1>
              {getGreeting()}, Dr. {user?.firstName || "Doctor"}!
            </h1>
            <p>Today is {formattedToday}</p>
          </div>

          <section className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <div>
                <h3>Today's Appointments</h3>
                <strong>{todayAppointments.length}</strong>
                <p>Scheduled for today</p>
                <span className={styles.greenBadge}>
                  {confirmedToday.length} confirmed
                </span>
              </div>

              <div className={styles.iconBoxBlue}>
                <CalendarDays size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.green}`}>
              <div>
                <h3>Completed Today</h3>
                <strong className={styles.greenText}>
                  {completedToday.length}
                </strong>
                <p>Patients treated</p>
                <span>
                  {todayAppointments.length - completedToday.length} remaining
                </span>
              </div>

              <div className={styles.iconBoxGreen}>
                <CheckCircle size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.purple}`}>
              <div>
                <h3>Total Patients</h3>
                <strong>{patients.length}</strong>
                <p>Under your care</p>
                <span className={styles.greenSmall}>↗ +2 this week</span>
              </div>

              <div className={styles.iconBoxPurple}>
                <UsersRound size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.orange}`}>
              <div>
                <h3>Upcoming</h3>
                <strong>{upcomingAppointments.length}</strong>
                <p>Future appointments</p>
                <span>Next 7 days</span>
              </div>

              <div className={styles.iconBoxOrange}>
                <Activity size={22} />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2>Today's Schedule</h2>
                <p>Your appointments for today</p>
              </div>

              <button
                className={styles.smallOutline}
                onClick={() => navigate("/doctor-schedule")}
              >
                View Full Schedule
              </button>
            </div>

            {todayAppointments.length === 0 ? (
              <div className={styles.emptySchedule}>
                <CalendarDays size={46} />
                <h3>No appointments scheduled for today</h3>
                <p>Enjoy your day off!</p>
              </div>
            ) : (
              <div className={styles.todayList}>
                {todayAppointments.map((appointment) => (
                  <div className={styles.todayItem} key={appointment.id}>
                    <div>
                      <h3>{appointment.patient_name}</h3>
                      <p>{appointment.treatment_type}</p>
                    </div>

                    <div className={styles.timeCell}>
                      <Clock3 size={15} />
                      {appointment.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2>Upcoming Appointments</h2>
                <p>Your scheduled patients</p>
              </div>

              <button
                className={styles.smallOutline}
                onClick={() => navigate("/doctor-schedule")}
              >
                View All
              </button>
            </div>

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Date</span>
                <span>Time</span>
                <span>Patient</span>
                <span>Treatment</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {upcomingAppointments.slice(0, 5).map((appointment) => (
                <div className={styles.tableRow} key={appointment.id}>
                  <span className={styles.dateBadge}>
                    {formatDateBadge(appointment.date)}
                  </span>

                  <span className={styles.timeCell}>
                    <Clock3 size={14} />
                    {appointment.time}
                  </span>

                  <span className={styles.patientName}>
                    {appointment.patient_name}
                  </span>

                  <span className={styles.muted}>
                    {appointment.treatment_type}
                  </span>

                  <span
                    className={`${styles.status} ${
                      styles[appointment.status] || ""
                    }`}
                  >
                    {appointment.status}
                  </span>

                  <button className={styles.viewBtn}>View</button>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.sectionHeader}>
                <h2>Weekly Activity</h2>
                <p>Your appointments this week</p>
              </div>

              <div className={styles.barChart}>
                <div className={styles.yAxis}>
                  <span>8</span>
                  <span>6</span>
                  <span>4</span>
                  <span>2</span>
                  <span>0</span>
                </div>

                <div className={styles.bars}>
                  <div>
                    <span style={{ height: "50%" }}></span>
                    <p>Mon</p>
                  </div>
                  <div>
                    <span style={{ height: "75%" }}></span>
                    <p>Tue</p>
                  </div>
                  <div>
                    <span style={{ height: "38%" }}></span>
                    <p>Wed</p>
                  </div>
                  <div>
                    <span style={{ height: "88%" }}></span>
                    <p>Thu</p>
                  </div>
                  <div>
                    <span style={{ height: "62%" }}></span>
                    <p>Fri</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.sectionHeader}>
                <h2>Treatment Types</h2>
                <p>Your cases by category</p>
              </div>

              <div className={styles.donutWrap}>
                <div className={styles.donut}></div>

                <div className={styles.legend}>
                  <div>
                    <span className={styles.dotBlue}></span>
                    <p>Check-ups</p>
                    <strong>5</strong>
                  </div>

                  <div>
                    <span className={styles.dotGreen}></span>
                    <p>Fillings</p>
                    <strong>3</strong>
                  </div>

                  <div>
                    <span className={styles.dotOrange}></span>
                    <p>Root Canals</p>
                    <strong>2</strong>
                  </div>

                  <div>
                    <span className={styles.dotPurple}></span>
                    <p>Other</p>
                    <strong>4</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.quickActions}>
            <button onClick={() => navigate("/doctor-patients")}>
              <div className={styles.iconBoxPurple}>
                <UsersRound size={22} />
              </div>
              <div>
                <h3>View Patients</h3>
                <p>Patient records</p>
              </div>
            </button>

            <button onClick={() => navigate("/doctor-treatments")}>
              <div className={styles.iconBoxGreen}>
                <CheckCircle size={22} />
              </div>
              <div>
                <h3>Treatments</h3>
                <p>Add & view</p>
              </div>
            </button>

            <button onClick={() => navigate("/doctor-availability")}>
              <div className={styles.iconBoxOrange}>
                <Clock3 size={22} />
              </div>
              <div>
                <h3>Availability</h3>
                <p>Manage schedule</p>
              </div>
            </button>
          </section>
        </section>
      </main>
    </div>
  );
}

export default DoctorDashboard;
