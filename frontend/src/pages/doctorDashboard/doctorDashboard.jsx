import { useEffect, useMemo, useState } from "react";
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

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const toSqlDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseSqlDate = (value) => {
  if (!value) return null;

  const [year, month, day] = String(value).split("T")[0].split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return date;
};

const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);

  return result;
};

const getDateKey = (date) => {
  if (!date) return "";

  const dateValue = String(date);

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return toSqlDate(parsedDate);
};

const getShortDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}`;
};

const getDaysBetween = (startDate, endDate) => {
  return (
    Math.round(
      (endDate.getTime() - startDate.getTime()) / DAY_IN_MILLISECONDS,
    ) + 1
  );
};

const getPeriodRange = (period, customStartDate, customEndDate) => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  if (period === "week") {
    const currentDay = todayDate.getDay();
    const distanceFromMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const start = addDays(todayDate, distanceFromMonday);
    const end = addDays(start, 4);

    return {
      start,
      end,
    };
  }

  if (period === "month") {
    return {
      start: new Date(todayDate.getFullYear(), todayDate.getMonth(), 1),

      end: new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0),
    };
  }

  if (period === "threeMonths") {
    return {
      start: new Date(todayDate.getFullYear(), todayDate.getMonth() - 2, 1),

      end: new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0),
    };
  }

  if (period === "custom") {
    const start = parseSqlDate(customStartDate);
    const end = parseSqlDate(customEndDate);

    if (!start || !end || start > end) {
      return null;
    }

    return {
      start,
      end,
    };
  }

  return null;
};

function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentDate = new Date();
  const defaultCustomStartDate = addDays(currentDate, -6);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [viewingAppointment, setViewingAppointment] = useState(null);

  const [appointmentPeriod, setAppointmentPeriod] = useState("week");

  const [customStartDate, setCustomStartDate] = useState(
    toSqlDate(defaultCustomStartDate),
  );

  const [customEndDate, setCustomEndDate] = useState(toSqlDate(currentDate));

  const [treatmentPeriod, setTreatmentPeriod] = useState("threeMonths");

  const [treatmentCustomStartDate, setTreatmentCustomStartDate] = useState(
    toSqlDate(defaultCustomStartDate),
  );

  const [treatmentCustomEndDate, setTreatmentCustomEndDate] = useState(
    toSqlDate(currentDate),
  );

  const [chartAppointments, setChartAppointments] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState("");

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
        const patientsRes = await api.get("/users?role=patient");
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.log("Failed to load patients", error);
        setPatients(new Array(8).fill(null));
      }
    };

    loadDoctorDashboard();
  }, [user]);

  const chartRange = useMemo(() => {
    return getPeriodRange(appointmentPeriod, customStartDate, customEndDate);
  }, [appointmentPeriod, customStartDate, customEndDate]);

  const treatmentRange = useMemo(() => {
    return getPeriodRange(
      treatmentPeriod,
      treatmentCustomStartDate,
      treatmentCustomEndDate,
    );
  }, [treatmentPeriod, treatmentCustomStartDate, treatmentCustomEndDate]);

  useEffect(() => {
    let ignoreResult = false;

    const loadChartAppointments = async () => {
      if (!user?.id || !chartRange) {
        setChartAppointments([]);
        setChartError("");
        setChartLoading(false);
        return;
      }

      try {
        setChartLoading(true);
        setChartError("");

        const res = await api.get("/appointments", {
          params: {
            doctorId: user.id,
            fromDate: toSqlDate(chartRange.start),
            toDate: toSqlDate(chartRange.end),
          },
        });

        if (!ignoreResult) {
          setChartAppointments(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.log("Failed to load doctor activity chart", error);

        if (!ignoreResult) {
          setChartError(
            error.response?.data?.message ||
              "Failed to load appointment activity",
          );

          setChartAppointments([]);
        }
      } finally {
        if (!ignoreResult) {
          setChartLoading(false);
        }
      }
    };

    loadChartAppointments();

    return () => {
      ignoreResult = true;
    };
  }, [user?.id, chartRange]);

  const appointmentChartData = useMemo(() => {
    if (!chartRange) return [];

    const countsByDate = {};

    chartAppointments.forEach((appointment) => {
      const appointmentDate = getDateKey(appointment.date);

      if (!appointmentDate) return;

      countsByDate[appointmentDate] = (countsByDate[appointmentDate] || 0) + 1;
    });

    const getCountBetweenDates = (startDate, endDate) => {
      let total = 0;
      let cursor = new Date(startDate);

      while (cursor <= endDate) {
        total += countsByDate[toSqlDate(cursor)] || 0;
        cursor = addDays(cursor, 1);
      }

      return total;
    };

    const buildDailyData = (startDate, endDate, useWeekdayLabel) => {
      const data = [];
      let cursor = new Date(startDate);

      while (cursor <= endDate) {
        const dateKey = toSqlDate(cursor);

        data.push({
          label: useWeekdayLabel
            ? cursor.toLocaleDateString("en-GB", {
                weekday: "short",
              })
            : getShortDate(cursor),

          count: countsByDate[dateKey] || 0,
        });

        cursor = addDays(cursor, 1);
      }

      return data;
    };

    const buildWeeklyData = (startDate, endDate) => {
      const data = [];
      let cursor = new Date(startDate);

      while (cursor <= endDate) {
        const bucketStart = new Date(cursor);
        const possibleEnd = addDays(bucketStart, 6);

        const bucketEnd =
          possibleEnd > endDate ? new Date(endDate) : possibleEnd;

        data.push({
          label: `${getShortDate(bucketStart)}-${getShortDate(bucketEnd)}`,

          count: getCountBetweenDates(bucketStart, bucketEnd),
        });

        cursor = addDays(bucketEnd, 1);
      }

      return data;
    };

    const buildMonthlyData = (startDate, endDate) => {
      const data = [];

      let monthCursor = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1,
      );

      while (monthCursor <= endDate) {
        const monthStart =
          monthCursor < startDate ? new Date(startDate) : new Date(monthCursor);

        const lastDayOfMonth = new Date(
          monthCursor.getFullYear(),
          monthCursor.getMonth() + 1,
          0,
        );

        const monthEnd =
          lastDayOfMonth > endDate ? new Date(endDate) : lastDayOfMonth;

        data.push({
          label: monthCursor.toLocaleDateString("en-GB", {
            month: "short",
            year: "2-digit",
          }),

          count: getCountBetweenDates(monthStart, monthEnd),
        });

        monthCursor = new Date(
          monthCursor.getFullYear(),
          monthCursor.getMonth() + 1,
          1,
        );
      }

      return data;
    };

    if (appointmentPeriod === "week") {
      return buildDailyData(chartRange.start, chartRange.end, true);
    }

    if (appointmentPeriod === "month") {
      return buildWeeklyData(chartRange.start, chartRange.end);
    }

    if (appointmentPeriod === "threeMonths") {
      return buildMonthlyData(chartRange.start, chartRange.end);
    }

    const totalDays = getDaysBetween(chartRange.start, chartRange.end);

    if (totalDays <= 14) {
      return buildDailyData(chartRange.start, chartRange.end, false);
    }

    if (totalDays <= 90) {
      return buildWeeklyData(chartRange.start, chartRange.end);
    }

    return buildMonthlyData(chartRange.start, chartRange.end);
  }, [chartAppointments, chartRange, appointmentPeriod]);

  const treatmentChartData = useMemo(() => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

    if (!treatmentRange) {
      return {
        segments: [],
        gradient: "#e5e7eb",
      };
    }

    const counts = {};
    const startDateKey = toSqlDate(treatmentRange.start);
    const endDateKey = toSqlDate(treatmentRange.end);

    appointments.forEach((appointment) => {
      const appointmentDate = getDateKey(appointment.date);

      const status = String(appointment.status || "").toLowerCase();

      if (
        !appointmentDate ||
        appointmentDate < startDateKey ||
        appointmentDate > endDateKey ||
        status === "cancelled"
      ) {
        return;
      }

      const treatmentName = appointment.treatment_type || "Other";

      counts[treatmentName] = (counts[treatmentName] || 0) + 1;
    });

    const sortedTreatments = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const mainTreatments = sortedTreatments.slice(0, 3);

    const otherCount = sortedTreatments
      .slice(3)
      .reduce((sum, treatment) => sum + treatment[1], 0);

    const treatmentSegments = [...mainTreatments];

    if (otherCount > 0) {
      treatmentSegments.push(["Other", otherCount]);
    }

    const segments = treatmentSegments.map(([name, count], index) => ({
      name,
      count,
      color: colors[index],
    }));

    const total = segments.reduce((sum, segment) => sum + segment.count, 0);

    if (total === 0) {
      return {
        segments: [],
        gradient: "#e5e7eb",
      };
    }

    let currentPercentage = 0;

    const gradientParts = segments.map((segment) => {
      const startPercentage = currentPercentage;

      currentPercentage += (segment.count / total) * 100;

      return `${segment.color} ${startPercentage}% ${currentPercentage}%`;
    });

    return {
      segments,
      gradient: `conic-gradient(${gradientParts.join(", ")})`,
    };
  }, [appointments, treatmentRange]);

  const maximumAppointmentCount = Math.max(
    ...appointmentChartData.map((item) => item.count),
    0,
  );

  const yAxisMaximum = Math.max(4, Math.ceil(maximumAppointmentCount / 4) * 4);

  const yAxisLabels = [
    yAxisMaximum,
    Math.round(yAxisMaximum * 0.75),
    Math.round(yAxisMaximum * 0.5),
    Math.round(yAxisMaximum * 0.25),
    0,
  ];

  const chartPeriodNames = {
    week: "This Week",
    month: "This Month",
    threeMonths: "Last 3 Months",
    custom: "Custom Range",
  };

  const chartDescription = chartRange
    ? `${
        chartPeriodNames[appointmentPeriod]
      }: ${chartRange.start.toLocaleDateString(
        "en-GB",
      )} - ${chartRange.end.toLocaleDateString("en-GB")}`
    : "Select a valid date range";

  const treatmentDescription = treatmentRange
    ? `${
        chartPeriodNames[treatmentPeriod]
      }: ${treatmentRange.start.toLocaleDateString(
        "en-GB",
      )} - ${treatmentRange.end.toLocaleDateString("en-GB")}`
    : "Select a valid date range";

  const now = new Date();
  const today = toSqlDate(now);

  const currentTime = `${String(now.getHours()).padStart(
    2,
    "0",
  )}:${String(now.getMinutes()).padStart(2, "0")}`;

  const todayAppointments = appointments.filter(
    (appointment) => getDateKey(appointment.date) === today,
  );

  const completedToday = todayAppointments.filter(
    (appointment) => String(appointment.status).toLowerCase() === "completed",
  );

  const upcomingAppointments = appointments.filter((appointment) => {
    const status = String(appointment.status || "").toLowerCase();

    const appointmentDate = getDateKey(appointment.date);

    const appointmentTime = String(appointment.time || "").slice(0, 5);

    if (status === "completed" || status === "cancelled") {
      return false;
    }

    if (appointmentDate > today) {
      return true;
    }

    if (appointmentDate === today) {
      return appointmentTime >= currentTime;
    }

    return false;
  });

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

                  <button
                    type="button"
                    className={styles.viewBtn}
                    onClick={() => setViewingAppointment(appointment)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeaderRow}>
                <div className={styles.sectionHeader}>
                  <h2>Appointment Volume</h2>
                  <p>{chartDescription}</p>
                </div>

                <select
                  className={styles.periodSelect}
                  value={appointmentPeriod}
                  onChange={(event) => setAppointmentPeriod(event.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="threeMonths">Last 3 Months</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {appointmentPeriod === "custom" && (
                <div className={styles.customRange}>
                  <label>
                    From
                    <input
                      type="date"
                      value={customStartDate}
                      max={customEndDate || undefined}
                      onChange={(event) =>
                        setCustomStartDate(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    To
                    <input
                      type="date"
                      value={customEndDate}
                      min={customStartDate || undefined}
                      onChange={(event) => setCustomEndDate(event.target.value)}
                    />
                  </label>
                </div>
              )}

              {chartLoading ? (
                <div className={styles.chartMessage}>
                  Loading appointment data...
                </div>
              ) : !chartRange ? (
                <div className={styles.chartError}>
                  Start date must be before end date
                </div>
              ) : chartError ? (
                <div className={styles.chartError}>{chartError}</div>
              ) : (
                <div className={styles.barChart}>
                  <div className={styles.yAxis}>
                    {yAxisLabels.map((label, index) => (
                      <span key={`${label}-${index}`}>{label}</span>
                    ))}
                  </div>

                  <div className={styles.barsScroll}>
                    <div
                      className={styles.bars}
                      style={{
                        gridTemplateColumns: `repeat(${Math.max(
                          appointmentChartData.length,
                          1,
                        )}, minmax(48px, 1fr))`,

                        minWidth: `${Math.max(
                          440,
                          appointmentChartData.length * 78,
                        )}px`,
                      }}
                    >
                      {appointmentChartData.map((item, index) => {
                        const barHeight =
                          item.count === 0
                            ? "0%"
                            : `${Math.max(
                                (item.count / yAxisMaximum) * 100,
                                4,
                              )}%`;

                        return (
                          <div
                            className={styles.barItem}
                            key={`${item.label}-${index}`}
                          >
                            <div
                              className={styles.barColumn}
                              style={{
                                height: barHeight,
                              }}
                            >
                              <small>{item.count}</small>
                              <span></span>
                            </div>

                            <p>{item.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartHeaderRow}>
                <div className={styles.sectionHeader}>
                  <h2>Treatment Types</h2>
                  <p>{treatmentDescription}</p>
                </div>

                <select
                  className={styles.periodSelect}
                  value={treatmentPeriod}
                  onChange={(event) => setTreatmentPeriod(event.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="threeMonths">Last 3 Months</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {treatmentPeriod === "custom" && (
                <div className={styles.customRange}>
                  <label>
                    From
                    <input
                      type="date"
                      value={treatmentCustomStartDate}
                      max={treatmentCustomEndDate || undefined}
                      onChange={(event) =>
                        setTreatmentCustomStartDate(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    To
                    <input
                      type="date"
                      value={treatmentCustomEndDate}
                      min={treatmentCustomStartDate || undefined}
                      onChange={(event) =>
                        setTreatmentCustomEndDate(event.target.value)
                      }
                    />
                  </label>
                </div>
              )}

              {!treatmentRange ? (
                <div className={styles.chartError}>
                  Start date must be before end date
                </div>
              ) : (
                <div className={styles.donutWrap}>
                  <div
                    className={styles.donut}
                    style={{
                      background: treatmentChartData.gradient,
                    }}
                  ></div>

                  <div className={styles.legend}>
                    {treatmentChartData.segments.length === 0 ? (
                      <div className={styles.noChartData}>
                        No treatment data found
                      </div>
                    ) : (
                      treatmentChartData.segments.map((segment) => (
                        <div key={segment.name}>
                          <span
                            className={styles.dynamicLegendDot}
                            style={{
                              backgroundColor: segment.color,
                            }}
                          ></span>

                          <p>{segment.name}</p>
                          <strong>{segment.count}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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

        {viewingAppointment && (
          <div
            className={styles.modalOverlay}
            onClick={() => setViewingAppointment(null)}
          >
            <div
              className={styles.modalCard}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h2>Appointment Details</h2>
                  <p>View appointment information</p>
                </div>

                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setViewingAppointment(null)}
                >
                  ×
                </button>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Patient</span>

                  <p>{viewingAppointment.patient_name || "Not available"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date</span>

                  <p>
                    {viewingAppointment.date
                      ? new Date(viewingAppointment.date).toLocaleDateString(
                          "en-GB",
                        )
                      : "Not available"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Time</span>

                  <p>
                    {viewingAppointment.time
                      ? String(viewingAppointment.time).slice(0, 5)
                      : "Not available"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status</span>

                  <span
                    className={`${styles.status} ${
                      styles[
                        String(viewingAppointment.status || "").toLowerCase()
                      ] || ""
                    }`}
                  >
                    {viewingAppointment.status || "Not available"}
                  </span>
                </div>

                <div className={`${styles.detailItem} ${styles.fullDetail}`}>
                  <span className={styles.detailLabel}>Treatment</span>

                  <p>{viewingAppointment.treatment_type || "Not available"}</p>
                </div>

                <div className={`${styles.detailItem} ${styles.fullDetail}`}>
                  <span className={styles.detailLabel}>Notes</span>

                  <p className={styles.notesText}>
                    {viewingAppointment.notes || "No notes were added"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorDashboard;
