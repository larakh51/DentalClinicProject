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

  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        const appointmentsRes = await api.get(
          `/appointments?patientId=${user.id}`,
        );
        setAppointments(appointmentsRes.data || []);

        const invoicesRes = await api.get(`/invoices?patientId=${user.id}`);
        setInvoices(invoicesRes.data || []);

        const treatmentsRes = await api.get(`/treatments?patientId=${user.id}`);
        setTreatments(treatmentsRes.data || []);
      } catch (error) {
        console.log("Failed to load patient dashboard", error);
      }
    };

    loadDashboardData();
  }, [user]);

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid",
  );

  const totalSpent = invoices.reduce((sum, invoice) => {
    return sum + Number(invoice.amount || 0);
  }, 0);

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status !== "cancelled",
  );

  const nextAppointment = upcomingAppointments[0];

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
                    ? new Date(nextAppointment.date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                        },
                      )
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
                <strong>₪{pendingInvoices.length}</strong>
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
                <span>
                  {appointments.filter((a) => a.status === "completed").length}{" "}
                  completed recently
                </span>
              </div>
              <div className={styles.iconBoxGreen}>
                <Activity size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.purple}`}>
              <div>
                <h3>Total Spent</h3>
                <strong>₪{totalSpent}</strong>
                <p>Lifetime</p>
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
                      {new Date(appointment.date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>

                    <span className={styles.timeCell}>
                      <Clock size={14} />
                      {appointment.time}
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
                <p>None reported</p>
              </div>
            </div>

            <div className={`${styles.healthBox} ${styles.blueBox}`}>
              <Heart size={20} />
              <div>
                <h4>Conditions</h4>
                <p>None reported</p>
              </div>
            </div>

            <div className={`${styles.healthBox} ${styles.greenBox}`}>
              <Pill size={20} />
              <div>
                <h4>Medications</h4>
                <p>None reported</p>
              </div>
            </div>

            <button className={styles.outlineButton}>View Full Record</button>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2>Recent Treatments</h2>
                <p>Your treatment history</p>
              </div>

              <button className={styles.smallOutline}>View All</button>
            </div>

            <div className={styles.treatmentsList}>
              {treatments.length === 0 ? (
                <div className={styles.empty}>No treatments yet</div>
              ) : (
                treatments.slice(0, 2).map((treatment) => (
                  <div className={styles.treatmentItem} key={treatment.id}>
                    <div>
                      <h4>{treatment.description}</h4>
                      <p>
                        {new Date(treatment.date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <strong>₪{treatment.cost}</strong>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.quickActions}>
            <div className={styles.actionCard}>
              <div className={styles.iconBoxPurple}>
                <FileText size={22} />
              </div>
              <div>
                <h3>Medical Record</h3>
                <p>View your health information</p>
              </div>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.iconBoxGreen}>
                <Activity size={22} />
              </div>
              <div>
                <h3>Update Profile</h3>
                <p>Manage your account settings</p>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;
