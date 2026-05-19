import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersRound,
  CalendarDays,
  DollarSign,
  AlertCircle,
  Clock3,
  CheckCircle,
  BarChart3,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerDashboard.module.css";

function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const appointmentsRes = await api.get("/appointments");
        setAppointments(appointmentsRes.data || []);
      } catch (error) {
        console.log("Failed to load appointments", error);

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
        ]);
      }

      try {
        const usersRes = await api.get("/users");
        const users = usersRes.data || [];

        setPatients(users.filter((item) => item.role === "patient"));
        setStaff(users.filter((item) => item.role === "doctor"));
      } catch (error) {
        console.log("Failed to load users", error);

        setPatients(new Array(15).fill(null));
        setStaff([
          {
            id: "d1",
            first_name: "David",
            last_name: "Levi",
            email: "doctor@demo.com",
          },
          {
            id: "d2",
            first_name: "Maya",
            last_name: "Goldstein",
            email: "doctor2@demo.com",
          },
          {
            id: "d3",
            first_name: "Yaron",
            last_name: "Cohen",
            email: "doctor3@demo.com",
          },
        ]);
      }

      try {
        const invoicesRes = await api.get("/invoices");
        setInvoices(invoicesRes.data || []);
      } catch (error) {
        console.log("Failed to load invoices", error);

        setInvoices([
          {
            id: "inv1",
            patient_name: "Noa Shapiro",
            date: "2026-03-27",
            amount: 150,
            status: "pending",
          },
          {
            id: "inv2",
            patient_name: "David Katz",
            date: "2026-03-26",
            amount: 1500,
            status: "pending",
          },
          {
            id: "inv3",
            patient_name: "Moshe Azoulay",
            date: "2026-03-22",
            amount: 950,
            status: "pending",
          },
          {
            id: "inv4",
            patient_name: "Rina Shalev",
            date: "2026-03-21",
            amount: 380,
            status: "paid",
          },
          {
            id: "inv5",
            patient_name: "Yossi Hazan",
            date: "2026-03-19",
            amount: 1200,
            status: "pending",
          },
        ]);
      }
    };

    loadDashboardData();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === today,
  );

  const confirmedToday = todayAppointments.filter(
    (appointment) => appointment.status === "confirmed",
  );

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

  const pendingPayments = invoices
    .filter((invoice) => invoice.status === "pending")
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "pending",
  );

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
          <div className={styles.pageHeader}>
            <h1>Clinic Management Dashboard</h1>
            <p>System overview and analytics</p>
          </div>

          <section className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <div>
                <h3>Total Patients</h3>
                <strong>{patients.length}</strong>
                <p>Registered patients</p>
                <span className={styles.greenSmall}>↗ +3 this week</span>
              </div>

              <div className={styles.iconBoxBlue}>
                <UsersRound size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.purple}`}>
              <div>
                <h3>Today's Appointments</h3>
                <strong>{todayAppointments.length}</strong>
                <p>Scheduled for today</p>
                <span className={styles.greenBadge}>
                  {confirmedToday.length} confirmed
                </span>
              </div>

              <div className={styles.iconBoxPurple}>
                <CalendarDays size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.green}`}>
              <div>
                <h3>Total Revenue</h3>
                <strong className={styles.greenText}>
                  ₪{totalRevenue || 7020}
                </strong>
                <p>All time</p>
                <span>₪3,020 collected</span>
              </div>

              <div className={styles.iconBoxGreen}>
                <DollarSign size={22} />
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.orange}`}>
              <div>
                <h3>Pending Payments</h3>
                <strong className={styles.orangeText}>
                  ₪{pendingPayments || 4000}
                </strong>
                <p>To be collected</p>
                <span>{pendingInvoices.length || 5} invoices</span>
              </div>

              <div className={styles.iconBoxOrange}>
                <AlertCircle size={22} />
              </div>
            </div>
          </section>

          <section className={styles.topGrid}>
            <div className={styles.card}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2>Upcoming Appointments</h2>
                  <p>Next scheduled visits</p>
                </div>

                <button
                  className={styles.smallOutline}
                  onClick={() => navigate("/manager-appointments")}
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
                </div>

                {appointments.slice(0, 5).map((appointment) => (
                  <div className={styles.tableRow} key={appointment.id}>
                    <span className={styles.dateBadge}>
                      {formatDate(appointment.date)}
                    </span>
                    <span>{appointment.time}</span>
                    <span className={styles.bold}>
                      {appointment.patient_name}
                    </span>
                    <span>{appointment.treatment_type}</span>
                    <span
                      className={`${styles.status} ${
                        styles[appointment.status] || ""
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2>Recent Invoices</h2>
                  <p>Latest billing activity</p>
                </div>

                <button
                  className={styles.smallOutline}
                  onClick={() => navigate("/manager-finance")}
                >
                  View All
                </button>
              </div>

              <div className={styles.invoiceList}>
                {invoices.slice(0, 5).map((invoice) => (
                  <div className={styles.invoiceItem} key={invoice.id}>
                    <div className={styles.invoiceLeft}>
                      <div
                        className={
                          invoice.status === "paid"
                            ? styles.paidIcon
                            : styles.pendingIcon
                        }
                      >
                        {invoice.status === "paid" ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Clock3 size={18} />
                        )}
                      </div>

                      <div>
                        <h3>{invoice.patient_name}</h3>
                        <p>{formatDate(invoice.date)}</p>
                      </div>
                    </div>

                    <div className={styles.invoiceRight}>
                      <strong>₪{invoice.amount}</strong>
                      <span
                        className={`${styles.status} ${
                          styles[invoice.status] || ""
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.sectionHeader}>
                <h2>Weekly Appointments</h2>
                <p>Appointment volume this week</p>
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
                    <span style={{ height: "38%" }}></span>
                    <p>Mon</p>
                  </div>
                  <div>
                    <span style={{ height: "63%" }}></span>
                    <p>Tue</p>
                  </div>
                  <div>
                    <span style={{ height: "50%" }}></span>
                    <p>Wed</p>
                  </div>
                  <div>
                    <span style={{ height: "75%" }}></span>
                    <p>Thu</p>
                  </div>
                  <div>
                    <span style={{ height: "38%" }}></span>
                    <p>Fri</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.sectionHeader}>
                <h2>Revenue Trend</h2>
                <p>Monthly revenue growth</p>
              </div>

              <div className={styles.lineChart}>
                <div className={styles.linePointOne}></div>
                <div className={styles.linePointTwo}></div>
                <div className={styles.linePointThree}></div>
                <div className={styles.line}></div>

                <span className={styles.y8000}>8000</span>
                <span className={styles.y6000}>6000</span>
                <span className={styles.y4000}>4000</span>
                <span className={styles.y2000}>2000</span>
                <span className={styles.y0}>0</span>

                <span className={styles.xJan}>Jan</span>
                <span className={styles.xFeb}>Feb</span>
                <span className={styles.xMar}>Mar</span>
              </div>
            </div>
          </section>

          <section className={styles.bottomGrid}>
            <div className={styles.chartCard}>
              <div className={styles.sectionHeader}>
                <h2>Treatment Types</h2>
                <p>Distribution by category</p>
              </div>

              <div className={styles.donutWrap}>
                <div className={styles.donut}></div>

                <div className={styles.legendGrid}>
                  <div>
                    <span className={styles.dotBlue}></span>
                    Cleaning: 7
                  </div>
                  <div>
                    <span className={styles.dotGreen}></span>
                    Filling: 4
                  </div>
                  <div>
                    <span className={styles.dotOrange}></span>
                    Root Canal: 2
                  </div>
                  <div>
                    <span className={styles.dotPurple}></span>
                    Other: 8
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2>Clinic Staff</h2>
                  <p>Active employees</p>
                </div>

                <button
                  className={styles.smallOutline}
                  onClick={() => navigate("/manager-staff")}
                >
                  Manage
                </button>
              </div>

              <div className={styles.staffList}>
                {staff.slice(0, 3).map((doctor, index) => (
                  <div className={styles.staffItem} key={doctor?.id || index}>
                    <div className={styles.staffLeft}>
                      <div className={styles.staffAvatar}>⌁</div>
                      <div>
                        <h3>
                          Dr. {doctor?.first_name || "David"}{" "}
                          {doctor?.last_name || "Levi"}
                        </h3>
                        <p>Dentist</p>
                      </div>
                    </div>

                    <div className={styles.staffRight}>
                      <strong>0 appointments</strong>
                      <p>today</p>
                      <span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.quickActions}>
            <button onClick={() => navigate("/manager-patients")}>
              <div className={styles.iconBoxPurple}>
                <UsersRound size={22} />
              </div>
              <div>
                <h3>Manage Patients</h3>
                <p>{patients.length} total patients</p>
              </div>
            </button>

            <button onClick={() => navigate("/manager-reports")}>
              <div className={styles.iconBoxBlue}>
                <BarChart3 size={22} />
              </div>
              <div>
                <h3>View Reports</h3>
                <p>Analytics & insights</p>
              </div>
            </button>

            <button onClick={() => navigate("/manager-finance")}>
              <div className={styles.iconBoxGreen}>
                <DollarSign size={22} />
              </div>
              <div>
                <h3>Finance</h3>
                <p>₪{totalRevenue || 7020} revenue</p>
              </div>
            </button>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;
