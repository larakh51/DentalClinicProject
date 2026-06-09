import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  Activity,
  FileText,
  AlertCircle,
  Heart,
  Pill,
  Clock,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./patientDashboard.module.css";

function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [medicalRecord, setMedicalRecord] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        const [appointmentsRes, invoicesRes, treatmentsRes, medicalRecordRes] =
          await Promise.allSettled([
            api.get(`/appointments?patientId=${user.id}`),
            api.get(`/invoices?patientId=${user.id}`),
            api.get(`/treatments?patientId=${user.id}`),
            api.get(`/medical-records/patient/${user.id}`),
          ]);

        if (appointmentsRes.status === "fulfilled") {
          setAppointments(
            Array.isArray(appointmentsRes.value.data)
              ? appointmentsRes.value.data
              : [],
          );
        }

        if (invoicesRes.status === "fulfilled") {
          setInvoices(
            Array.isArray(invoicesRes.value.data) ? invoicesRes.value.data : [],
          );
        }

        if (treatmentsRes.status === "fulfilled") {
          setTreatments(
            Array.isArray(treatmentsRes.value.data)
              ? treatmentsRes.value.data
              : [],
          );
        }

        if (medicalRecordRes.status === "fulfilled") {
          const recordData = medicalRecordRes.value.data;

          setMedicalRecord(recordData.medicalRecord || null);

          if (Array.isArray(recordData.treatments)) {
            setTreatments(recordData.treatments);
          }
        }
      } catch (error) {
        console.log("Failed to load patient dashboard", error);
      }
    };

    loadDashboardData();
  }, [user]);

  const today = new Date().toISOString().split("T")[0];

  const formatTime = (time) => {
    if (!time) return "";
    return String(time).slice(0, 5);
  };

  const formatDate = (date, options) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid",
  );

  const pendingAmount = pendingInvoices.reduce((sum, invoice) => {
    return sum + Number(invoice.amount || 0);
  }, 0);

  const totalSpent = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => {
      return sum + Number(invoice.amount || 0);
    }, 0);

  const upcomingAppointments = appointments
    .filter((appointment) => {
      const status = String(appointment.status || "").toLowerCase();

      return (
        appointment.date >= today &&
        status !== "cancelled" &&
        status !== "completed"
      );
    })
    .sort((a, b) => {
      const dateA = `${a.date} ${formatTime(a.time)}`;
      const dateB = `${b.date} ${formatTime(b.time)}`;

      return dateA.localeCompare(dateB);
    });

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed",
  );

  const nextAppointment = upcomingAppointments[0];

  const allergies = medicalRecord?.allergies || "None reported";

  const conditions = medicalRecord?.chronic_diseases || "None reported";

  const medications = medicalRecord?.medications || "None reported";

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div></div>

          <div className={styles.userCircle}>
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.welcome}>
            <h1>Welcome back, {user?.firstName || "Patient"}!</h1>
            <p>Here's your dental health overview</p>
          </div>

          <section className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <div>
                <h3>Upcoming Visits</h3>
                <strong>{upcomingAppointments.length}</strong>
                <p>Scheduled appointments</p>
                <span>
                  Next:{" "}
                  {nextAppointment
                    ? formatDate(nextAppointment.date, {
                        day: "2-digit",
                        month: "short",
                      })
                    : "No visits"}
                </span>
              </div>

              <div className={styles.iconBoxBlue}>
                <Calendar size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.orange}`}>
              <div>
                <h3>Pending Payments</h3>
                <strong>₪{pendingAmount}</strong>
                <p>{pendingInvoices.length} invoice(s)</p>
              </div>

              <div className={styles.iconBoxOrange}>
                <CreditCard size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.green}`}>
              <div>
                <h3>Total Visits</h3>
                <strong>{appointments.length}</strong>
                <p>All time visits</p>
                <span>{completedAppointments.length} completed</span>
              </div>

              <div className={styles.iconBoxGreen}>
                <Activity size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.purple}`}>
              <div>
                <h3>Total Spent</h3>
                <strong>₪{totalSpent}</strong>
                <p>Paid invoices</p>
                <span>{invoices.length} total invoices</span>
              </div>

              <div className={styles.iconBoxPurple}>
                <FileText size={22} />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2>Upcoming Appointments</h2>
                <p>Your scheduled dental visits</p>
              </div>

              <button
                className={styles.newButton}
                onClick={() => navigate("/book-appointment")}
              >
                <Calendar size={16} />
                Book New
              </button>
            </div>

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Date</span>
                <span>Time</span>
                <span>Doctor</span>
                <span>Treatment</span>
                <span>Status</span>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className={styles.empty}>No upcoming appointments</div>
              ) : (
                upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div className={styles.tableRow} key={appointment.id}>
                    <span className={styles.dateBadge}>
                      {formatDate(appointment.date, {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>

                    <span className={styles.timeCell}>
                      <Clock size={14} />
                      {formatTime(appointment.time)}
                    </span>

                    <span>{appointment.doctor_name}</span>

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
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Health Summary</h2>
                <p>Quick medical info</p>
              </div>
            </div>

            <div className={`${styles.healthBox} ${styles.redBox}`}>
              <AlertCircle size={20} />
              <div>
                <h4>Allergies</h4>
                <p>{allergies}</p>
              </div>
            </div>

            <div className={`${styles.healthBox} ${styles.blueBox}`}>
              <Heart size={20} />
              <div>
                <h4>Conditions</h4>
                <p>{conditions}</p>
              </div>
            </div>

            <div className={`${styles.healthBox} ${styles.greenBox}`}>
              <Pill size={20} />
              <div>
                <h4>Medications</h4>
                <p>{medications}</p>
              </div>
            </div>

            <button
              type="button"
              className={styles.outlineButton}
              onClick={() => navigate("/medical-records")}
            >
              View Full Record
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2>Recent Treatments</h2>
                <p>Your treatment history</p>
              </div>

              <button
                type="button"
                className={styles.smallOutline}
                onClick={() => navigate("/medical-records")}
              >
                View All
              </button>
            </div>

            <div className={styles.treatmentsList}>
              {treatments.length === 0 ? (
                <div className={styles.empty}>No treatments yet</div>
              ) : (
                treatments.slice(0, 2).map((treatment) => (
                  <div className={styles.treatmentItem} key={treatment.id}>
                    <div>
                      <h4>{treatment.description}</h4>
                      <p>{formatDate(treatment.date)}</p>
                    </div>

                    <strong>₪{treatment.cost}</strong>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.quickActions}>
            <button
              type="button"
              className={styles.actionCard}
              onClick={() => navigate("/medical-records")}
            >
              <div className={styles.iconBoxPurple}>
                <FileText size={22} />
              </div>

              <div>
                <h3>Medical Record</h3>
                <p>View your health information</p>
              </div>
            </button>

            <button
              type="button"
              className={styles.actionCard}
              onClick={() => navigate("/profile")}
            >
              <div className={styles.iconBoxGreen}>
                <Activity size={22} />
              </div>

              <div>
                <h3>Update Profile</h3>
                <p>Manage your account settings</p>
              </div>
            </button>
          </section>
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;
