import { useEffect, useMemo, useState } from "react";
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

const getNiceMaximum = (value, fallback = 1000) => {
  const number = Number(value || 0);

  if (number <= 0) {
    return fallback;
  }

  const magnitude = 10 ** Math.floor(Math.log10(number));
  const normalizedValue = number / magnitude;

  let roundedValue = 10;

  if (normalizedValue <= 1) {
    roundedValue = 1;
  } else if (normalizedValue <= 2) {
    roundedValue = 2;
  } else if (normalizedValue <= 5) {
    roundedValue = 5;
  }

  return roundedValue * magnitude;
};

function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentDate = new Date();
  const defaultCustomStartDate = addDays(currentDate, -6);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [appointmentPeriod, setAppointmentPeriod] = useState("week");

  const [customStartDate, setCustomStartDate] = useState(
    toSqlDate(defaultCustomStartDate),
  );

  const [customEndDate, setCustomEndDate] = useState(toSqlDate(currentDate));

  const [revenuePeriod, setRevenuePeriod] = useState("threeMonths");

  const [revenueCustomStartDate, setRevenueCustomStartDate] = useState(
    toSqlDate(defaultCustomStartDate),
  );

  const [revenueCustomEndDate, setRevenueCustomEndDate] = useState(
    toSqlDate(currentDate),
  );

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

  const chartRange = useMemo(() => {
    return getPeriodRange(appointmentPeriod, customStartDate, customEndDate);
  }, [appointmentPeriod, customStartDate, customEndDate]);

  const revenueRange = useMemo(() => {
    return getPeriodRange(
      revenuePeriod,
      revenueCustomStartDate,
      revenueCustomEndDate,
    );
  }, [revenuePeriod, revenueCustomStartDate, revenueCustomEndDate]);

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
      if (!chartRange) {
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
            fromDate: toSqlDate(chartRange.start),
            toDate: toSqlDate(chartRange.end),
          },
        });

        if (!ignoreResult) {
          setChartAppointments(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.log("Failed to load appointment chart", error);

        if (!ignoreResult) {
          setChartError(
            error.response?.data?.message || "Failed to load appointment chart",
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
  }, [chartRange]);

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

  const revenueChartData = useMemo(() => {
    if (!revenueRange) return [];

    const totalsByDate = {};
    const startDateKey = toSqlDate(revenueRange.start);
    const endDateKey = toSqlDate(revenueRange.end);

    invoices.forEach((invoice) => {
      if (String(invoice.status || "").toLowerCase() !== "paid") {
        return;
      }

      const invoiceDate = getDateKey(invoice.date);

      if (
        !invoiceDate ||
        invoiceDate < startDateKey ||
        invoiceDate > endDateKey
      ) {
        return;
      }

      totalsByDate[invoiceDate] =
        (totalsByDate[invoiceDate] || 0) + Number(invoice.amount || 0);
    });

    const getTotalBetweenDates = (startDate, endDate) => {
      let total = 0;
      let cursor = new Date(startDate);

      while (cursor <= endDate) {
        total += totalsByDate[toSqlDate(cursor)] || 0;
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

          amount: totalsByDate[dateKey] || 0,
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

          amount: getTotalBetweenDates(bucketStart, bucketEnd),
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

          amount: getTotalBetweenDates(monthStart, monthEnd),
        });

        monthCursor = new Date(
          monthCursor.getFullYear(),
          monthCursor.getMonth() + 1,
          1,
        );
      }

      return data;
    };

    if (revenuePeriod === "week") {
      return buildDailyData(revenueRange.start, revenueRange.end, true);
    }

    if (revenuePeriod === "month") {
      return buildWeeklyData(revenueRange.start, revenueRange.end);
    }

    if (revenuePeriod === "threeMonths") {
      return buildMonthlyData(revenueRange.start, revenueRange.end);
    }

    const totalDays = getDaysBetween(revenueRange.start, revenueRange.end);

    if (totalDays <= 14) {
      return buildDailyData(revenueRange.start, revenueRange.end, false);
    }

    if (totalDays <= 90) {
      return buildWeeklyData(revenueRange.start, revenueRange.end);
    }

    return buildMonthlyData(revenueRange.start, revenueRange.end);
  }, [invoices, revenueRange, revenuePeriod]);

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

      const appointmentStatus = String(appointment.status || "").toLowerCase();

      if (
        !appointmentDate ||
        appointmentDate < startDateKey ||
        appointmentDate > endDateKey ||
        appointmentStatus === "cancelled"
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
      .reduce((sum, item) => sum + item[1], 0);

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

  const maximumRevenue = Math.max(
    ...revenueChartData.map((item) => item.amount),
    0,
  );

  const revenueYAxisMaximum = getNiceMaximum(maximumRevenue, 1000);

  const revenueYAxisLabels = [
    revenueYAxisMaximum,
    Math.round(revenueYAxisMaximum * 0.75),
    Math.round(revenueYAxisMaximum * 0.5),
    Math.round(revenueYAxisMaximum * 0.25),
    0,
  ];

  const revenueChartWidth = Math.max(560, revenueChartData.length * 90);

  const revenueChartHeight = 250;
  const revenueChartTop = 25;
  const revenueChartBottom = 48;

  const revenueChartPoints = revenueChartData.map((item, index) => {
    const availableWidth = revenueChartWidth - 50;

    const x =
      revenueChartData.length === 1
        ? revenueChartWidth / 2
        : 25 +
          (index * availableWidth) / Math.max(revenueChartData.length - 1, 1);

    const availableHeight =
      revenueChartHeight - revenueChartTop - revenueChartBottom;

    const y =
      revenueChartTop +
      availableHeight -
      (item.amount / revenueYAxisMaximum) * availableHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const revenueLinePath = revenueChartPoints
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  const chartPeriodName = {
    week: "This Week",
    month: "This Month",
    threeMonths: "Last 3 Months",
    custom: "Custom Range",
  };

  const chartDescription = chartRange
    ? `${
        chartPeriodName[appointmentPeriod]
      }: ${chartRange.start.toLocaleDateString(
        "en-GB",
      )} - ${chartRange.end.toLocaleDateString("en-GB")}`
    : "Select a valid date range";

  const revenueDescription = revenueRange
    ? `${
        chartPeriodName[revenuePeriod]
      }: ${revenueRange.start.toLocaleDateString(
        "en-GB",
      )} - ${revenueRange.end.toLocaleDateString("en-GB")}`
    : "Select a valid date range";

  const treatmentDescription = treatmentRange
    ? `${
        chartPeriodName[treatmentPeriod]
      }: ${treatmentRange.start.toLocaleDateString(
        "en-GB",
      )} - ${treatmentRange.end.toLocaleDateString("en-GB")}`
    : "Select a valid date range";

  const today = toSqlDate(new Date());

  const todayAppointments = appointments.filter(
    (appointment) => getDateKey(appointment.date) === today,
  );

  const confirmedToday = todayAppointments.filter(
    (appointment) => appointment.status === "confirmed",
  );

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => {
      return sum + Number(invoice.amount || 0);
    }, 0);

  const pendingPayments = invoices
    .filter((invoice) => invoice.status === "pending")
    .reduce((sum, invoice) => {
      return sum + Number(invoice.amount || 0);
    }, 0);

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
              <div className={styles.chartHeaderRow}>
                <div className={styles.sectionHeader}>
                  <h2>Appointment Volume</h2>
                  <p>{chartDescription}</p>
                </div>

                <select
                  className={styles.periodSelect}
                  value={appointmentPeriod}
                  onChange={(event) => setAppointmentPeriod(event.target.value)}
                  aria-label="Select appointment period"
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
                  <h2>Revenue Trend</h2>
                  <p>{revenueDescription}</p>
                </div>

                <select
                  className={styles.periodSelect}
                  value={revenuePeriod}
                  onChange={(event) => setRevenuePeriod(event.target.value)}
                  aria-label="Select revenue period"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="threeMonths">Last 3 Months</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {revenuePeriod === "custom" && (
                <div className={styles.customRange}>
                  <label>
                    From
                    <input
                      type="date"
                      value={revenueCustomStartDate}
                      max={revenueCustomEndDate || undefined}
                      onChange={(event) =>
                        setRevenueCustomStartDate(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    To
                    <input
                      type="date"
                      value={revenueCustomEndDate}
                      min={revenueCustomStartDate || undefined}
                      onChange={(event) =>
                        setRevenueCustomEndDate(event.target.value)
                      }
                    />
                  </label>
                </div>
              )}

              {!revenueRange ? (
                <div className={styles.chartError}>
                  Start date must be before end date
                </div>
              ) : (
                <div className={styles.revenueChartLayout}>
                  <div className={styles.revenueYAxis}>
                    {revenueYAxisLabels.map((label, index) => (
                      <span key={`${label}-${index}`}>
                        ₪{label.toLocaleString()}
                      </span>
                    ))}
                  </div>

                  <div className={styles.revenueChartScroll}>
                    <svg
                      className={styles.revenueChart}
                      viewBox={`0 0 ${revenueChartWidth} ${revenueChartHeight}`}
                      style={{
                        width: `${revenueChartWidth}px`,
                      }}
                    >
                      {revenueYAxisLabels.map((label, index) => {
                        const availableHeight =
                          revenueChartHeight -
                          revenueChartTop -
                          revenueChartBottom;

                        const y =
                          revenueChartTop +
                          (index * availableHeight) /
                            Math.max(revenueYAxisLabels.length - 1, 1);

                        return (
                          <line
                            key={`${label}-${index}`}
                            className={styles.revenueGridLine}
                            x1="0"
                            x2={revenueChartWidth}
                            y1={y}
                            y2={y}
                          />
                        );
                      })}

                      {revenueChartPoints.length > 0 && (
                        <path
                          className={styles.revenueLine}
                          d={revenueLinePath}
                        />
                      )}

                      {revenueChartPoints.map((point, index) => (
                        <g key={`${point.label}-${index}`}>
                          <circle
                            className={styles.revenuePoint}
                            cx={point.x}
                            cy={point.y}
                            r="5"
                          />

                          <text
                            className={styles.revenueValue}
                            x={point.x}
                            y={Math.max(point.y - 11, 14)}
                            textAnchor="middle"
                          >
                            ₪{point.amount.toLocaleString()}
                          </text>

                          <text
                            className={styles.revenueLabel}
                            x={point.x}
                            y={revenueChartHeight - 15}
                            textAnchor="middle"
                          >
                            {point.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={styles.bottomGrid}>
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
                  aria-label="Select treatment period"
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

                  <div className={styles.legendGrid}>
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
                          {segment.name}: {segment.count}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
