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
    statusBreakdown: {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    },
    monthlyAppointments: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await api.get("/reports/manager");

        setReports({
          totalAppointments: Number(res.data?.totalAppointments || 0),
          completedAppointments: Number(res.data?.completedAppointments || 0),
          completionRate: Number(res.data?.completionRate || 0),
          totalRevenue: Number(res.data?.totalRevenue || 0),

          statusBreakdown: {
            scheduled: Number(res.data?.statusBreakdown?.scheduled || 0),
            confirmed: Number(res.data?.statusBreakdown?.confirmed || 0),
            completed: Number(res.data?.statusBreakdown?.completed || 0),
            cancelled: Number(res.data?.statusBreakdown?.cancelled || 0),
          },

          monthlyAppointments: Array.isArray(res.data?.monthlyAppointments)
            ? res.data.monthlyAppointments
            : [],
        });
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

  const maximumMonthlyAppointments = Math.max(
    ...reports.monthlyAppointments.map((item) => Number(item.count || 0)),
    1,
  );

  const statusTotal = Object.values(reports.statusBreakdown).reduce(
    (total, count) => total + Number(count || 0),
    0,
  );

  const statusItems = [
    {
      label: "Scheduled",
      count: reports.statusBreakdown.scheduled,
      className: styles.scheduledBar,
    },
    {
      label: "Confirmed",
      count: reports.statusBreakdown.confirmed,
      className: styles.confirmedBar,
    },
    {
      label: "Completed",
      count: reports.statusBreakdown.completed,
      className: styles.completedBar,
    },
    {
      label: "Cancelled",
      count: reports.statusBreakdown.cancelled,
      className: styles.cancelledBar,
    },
  ];

  const formatMonth = (monthValue) => {
    if (!monthValue) return "";

    const [year, month] = monthValue.split("-");

    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      "en-US",
      {
        month: "short",
      },
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

            <div className={styles.analyticsGrid}>
              <div className={styles.chartBox}>
                <div className={styles.chartTitle}>
                  <BarChart3 size={19} />

                  <div>
                    <h3>Appointment Volume</h3>
                    <p>Appointments during the last 6 months</p>
                  </div>
                </div>

                <div className={styles.monthlyChart}>
                  {reports.monthlyAppointments.map((item) => {
                    const count = Number(item.count || 0);

                    const height =
                      count > 0
                        ? Math.max(
                            (count / maximumMonthlyAppointments) * 100,
                            5,
                          )
                        : 0;

                    return (
                      <div className={styles.monthColumn} key={item.month}>
                        <span className={styles.monthValue}>{count}</span>

                        <div className={styles.monthBarTrack}>
                          <div
                            className={styles.monthBar}
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>

                        <p className={styles.monthLabel}>
                          {formatMonth(item.month)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.chartBox}>
                <div className={styles.chartTitle}>
                  <CalendarDays size={19} />

                  <div>
                    <h3>Appointment Status</h3>
                    <p>Distribution by current status</p>
                  </div>
                </div>

                <div className={styles.statusList}>
                  {statusItems.map((item) => {
                    const percentage =
                      statusTotal > 0
                        ? Math.round((item.count / statusTotal) * 100)
                        : 0;

                    return (
                      <div className={styles.statusRow} key={item.label}>
                        <div className={styles.statusTop}>
                          <span>{item.label}</span>

                          <strong>
                            {item.count} ({percentage}%)
                          </strong>
                        </div>

                        <div className={styles.statusTrack}>
                          <div
                            className={`${styles.statusFill} ${item.className}`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerReports;
