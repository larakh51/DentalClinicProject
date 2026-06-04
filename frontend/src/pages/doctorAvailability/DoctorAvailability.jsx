import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorAvailability.module.css";

function DoctorAvailability() {
  const { user } = useAuth();

  const [schedule, setSchedule] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);

  const [editing, setEditing] = useState(false);
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);

  const [timeOffForm, setTimeOffForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setError("");

    try {
      const [scheduleRes, timeOffRes] = await Promise.all([
        api.get("/availability/me"),
        api.get("/availability/time-off"),
      ]);

      setSchedule(scheduleRes.data || []);
      setTimeOffRequests(timeOffRes.data || []);
    } catch (err) {
      console.log("Failed to load availability", err.response?.data || err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load availability",
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleChange = (id, field, value) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.id === id
          ? {
              ...day,
              [field]: field === "is_active" ? Number(value) : value,
            }
          : day,
      ),
    );
  };

  const saveSchedule = async () => {
    setError("");
    setSuccess("");

    try {
      await api.put("/availability/me", {
        schedule,
      });

      setSuccess("Schedule updated successfully");
      setEditing(false);
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update schedule",
      );
    }
  };

  const handleTimeOffChange = (e) => {
    setTimeOffForm({
      ...timeOffForm,
      [e.target.name]: e.target.value,
    });
  };

  const submitTimeOff = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      await api.post("/availability/time-off", timeOffForm);

      setSuccess("Time off request submitted successfully");

      setTimeOffForm({
        startDate: "",
        endDate: "",
        reason: "",
      });

      setShowTimeOffForm(false);
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit time off request",
      );
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    return String(time).slice(0, 5);
  };

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
            <h1>My Availability</h1>
            <p>Manage your working hours and availability</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && <div className={styles.successBox}>{success}</div>}

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Weekly Schedule</h2>
                <p>Your regular working hours</p>
              </div>

              {!editing ? (
                <button
                  className={styles.primaryBtn}
                  onClick={() => setEditing(true)}
                >
                  Edit Schedule
                </button>
              ) : (
                <button className={styles.primaryBtn} onClick={saveSchedule}>
                  Save Schedule
                </button>
              )}
            </div>

            <div className={styles.scheduleList}>
              {schedule.map((day) => (
                <div className={styles.scheduleItem} key={day.id}>
                  <h3>{day.day_name}</h3>

                  <div className={styles.timeBox}>
                    <Clock3 size={17} />

                    {editing ? (
                      <div className={styles.timeInputs}>
                        <input
                          type="time"
                          value={formatTime(day.opening_time)}
                          onChange={(e) =>
                            handleScheduleChange(
                              day.id,
                              "opening_time",
                              e.target.value,
                            )
                          }
                        />

                        <span>-</span>

                        <input
                          type="time"
                          value={formatTime(day.closing_time)}
                          onChange={(e) =>
                            handleScheduleChange(
                              day.id,
                              "closing_time",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    ) : (
                      <span>
                        {formatTime(day.opening_time)} -{" "}
                        {formatTime(day.closing_time)}
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <select
                      value={day.is_active}
                      onChange={(e) =>
                        handleScheduleChange(
                          day.id,
                          "is_active",
                          e.target.value,
                        )
                      }
                      className={styles.statusSelect}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`${styles.status} ${
                        Number(day.is_active) === 1
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      {Number(day.is_active) === 1 ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Time Off Requests</h2>
                <p>Manage vacation and unavailable dates</p>
              </div>
            </div>

            {!showTimeOffForm ? (
              <button
                className={styles.fullBtn}
                onClick={() => setShowTimeOffForm(true)}
              >
                <CalendarDays size={17} />
                Request Time Off
              </button>
            ) : (
              <form className={styles.timeOffForm} onSubmit={submitTimeOff}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={timeOffForm.startDate}
                      onChange={handleTimeOffChange}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={timeOffForm.endDate}
                      onChange={handleTimeOffChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Reason</label>
                  <textarea
                    name="reason"
                    value={timeOffForm.reason}
                    onChange={handleTimeOffChange}
                    placeholder="Reason for time off..."
                  />
                </div>

                <div className={styles.actions}>
                  <button type="submit" className={styles.primaryBtn}>
                    Submit Request
                  </button>

                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowTimeOffForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {timeOffRequests.length > 0 && (
              <div className={styles.requestsList}>
                {timeOffRequests.map((request) => (
                  <div className={styles.requestItem} key={request.id}>
                    <div>
                      <h3>
                        {formatDate(request.start_date)} -{" "}
                        {formatDate(request.end_date)}
                      </h3>
                      <p>{request.reason || "No reason provided"}</p>
                    </div>

                    <span className={`${styles.status} ${styles.pending}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default DoctorAvailability;
