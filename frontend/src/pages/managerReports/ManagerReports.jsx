import { useEffect, useState } from "react";
import { CalendarDays, DollarSign, TrendingUp, BarChart3 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerReports.module.css";

function ManagerReports() {
  const { user } = useAuth();

  const [reports, setReports] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    completionRate: 0,
    totalRevenue: 0,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await api.get("/reports/manager");
        setReports(res.data);
      } catch (err) {
        console.log("Failed to load reports", err.response?.data || err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load reports",
        );
      }
    };

    loadReports();
  }, []);

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
            <h1>Reports & Analytics</h1>
            <p>Clinic performance insights</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Total Appointments</h3>
                <CalendarDays size={18} />
              </div>

              <strong>{reports.totalAppointments}</strong>
              <p>All time</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Completion Rate</h3>
                <TrendingUp size={18} className={styles.greenIcon} />
              </div>

              <strong className={styles.greenText}>
                {reports.completionRate}%
              </strong>

              <p>
                {reports.completedAppointments} / {reports.totalAppointments}
              </p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <h3>Total Revenue</h3>
                <DollarSign size={18} className={styles.greenIcon} />
              </div>

              <strong className={styles.greenText}>
                ₪{reports.totalRevenue}
              </strong>

              <p>All time</p>
            </div>
          </section>

          <section className={styles.analyticsCard}>
            <div className={styles.cardHeader}>
              <h2>Analytics Dashboard</h2>
              <p>Visual representation of clinic data</p>
            </div>

            <div className={styles.placeholder}>
              <BarChart3 size={62} />
              <h3>Charts and graphs would appear here</h3>
              <p>Integration with recharts library</p>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerReports;
