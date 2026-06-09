import { useEffect, useState } from "react";
import { CalendarDays, Filter, Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerAppointments.module.css";

function ManagerAppointments() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data || []);
    } catch (error) {
      console.log("Failed to load appointments", error);
      setError("Failed to load appointments");
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatTime = (time) => {
    if (!time) return "";
    return String(time).slice(0, 5);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const search = searchTerm.toLowerCase();

    const patientName = String(appointment.patient_name || "").toLowerCase();
    const doctorName = String(appointment.doctor_name || "").toLowerCase();
    const treatment = String(appointment.treatment_type || "").toLowerCase();
    const status = String(appointment.status || "").toLowerCase();

    return (
      patientName.includes(search) ||
      doctorName.includes(search) ||
      treatment.includes(search) ||
      status.includes(search)
    );
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
          <div className={styles.headerRow}>
            <div>
              <h1>All Appointments</h1>
              <p>Manage clinic appointments</p>
            </div>

            <button
              className={styles.newBtn}
              onClick={() => alert("New appointment page will be added later")}
            >
              <CalendarDays size={17} />
              New Appointment
            </button>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Appointment List</h2>
                <p>All scheduled and past appointments</p>
              </div>

              <div className={styles.searchBox}>
                <Search size={19} />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className={styles.filterBtn}>
                <Filter size={17} />
                Filter
              </button>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Date & Time</span>
                <span>Patient</span>
                <span>Doctor</span>
                <span>Treatment</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className={styles.emptyBox}>No appointments found</div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div className={styles.tableRow} key={appointment.id}>
                    <div>
                      <strong className={styles.dateText}>
                        {formatDate(appointment.date)}
                      </strong>
                      <p className={styles.timeText}>
                        {formatTime(appointment.time)}
                      </p>
                    </div>

                    <span className={styles.patientName}>
                      {appointment.patient_name}
                    </span>

                    <span>{appointment.doctor_name}</span>

                    <span>{appointment.treatment_type}</span>

                    <span
                      className={`${styles.status} ${
                        styles[appointment.status] || ""
                      }`}
                    >
                      {appointment.status}
                    </span>

                    <button className={styles.editBtn}>Edit</button>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerAppointments;
