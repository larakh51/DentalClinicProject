import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Filter, Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerAppointments.module.css";

function ManagerAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    treatmentType: "",
    status: "",
    notes: "",
  });
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

  const formatInputDate = (date) => {
    if (!date) return "";
    return String(date).split("T")[0];
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const search = searchTerm.toLowerCase();

    const patientName = String(appointment.patient_name || "").toLowerCase();
    const doctorName = String(appointment.doctor_name || "").toLowerCase();
    const treatment = String(appointment.treatment_type || "").toLowerCase();
    const status = String(appointment.status || "").toLowerCase();
    const appointmentDate = formatInputDate(appointment.date);

    const matchesSearch =
      patientName.includes(search) ||
      doctorName.includes(search) ||
      treatment.includes(search) ||
      status.includes(search);

    const matchesStatus =
      statusFilter === "all" || status === statusFilter.toLowerCase();

    const matchesDate = !dateFilter || appointmentDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);

    setEditForm({
      date: formatInputDate(appointment.date),
      time: formatTime(appointment.time),
      treatmentType: appointment.treatment_type || "",
      status: appointment.status || "scheduled",
      notes: appointment.notes || "",
    });

    setError("");
  };

  const closeEditModal = () => {
    setEditingAppointment(null);

    setEditForm({
      date: "",
      time: "",
      treatmentType: "",
      status: "",
      notes: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();

    if (!editingAppointment?.id) return;

    try {
      await api.put(`/appointments/${editingAppointment.id}`, {
        date: editForm.date,
        time: editForm.time,
        treatment_type: editForm.treatmentType,
        treatmentType: editForm.treatmentType,
        treatmentTypeId: editingAppointment.treatment_type_id || null,
        status: editForm.status,
        notes: editForm.notes,
      });

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === editingAppointment.id
            ? {
                ...appointment,
                date: editForm.date,
                time: editForm.time,
                treatment_type: editForm.treatmentType,
                status: editForm.status,
                notes: editForm.notes,
              }
            : appointment,
        ),
      );

      closeEditModal();
    } catch (error) {
      console.log("Failed to update appointment", error);
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update appointment",
      );
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("");
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
          <div className={styles.headerRow}>
            <div>
              <h1>All Appointments</h1>
              <p>Manage clinic appointments</p>
            </div>

            <button
              className={styles.newBtn}
              onClick={() => navigate("/manager-book-appointment")}
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

              <button
                className={styles.filterBtn}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <Filter size={17} />
                Filter
              </button>
            </div>

            {showFilters && (
              <div className={styles.filterPanel}>
                <div className={styles.filterField}>
                  <label>Status</label>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label>Date</label>

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                <button
                  className={styles.clearFilterBtn}
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>
            )}

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
                        styles[
                          String(appointment.status || "").toLowerCase()
                        ] || ""
                      }`}
                    >
                      {appointment.status}
                    </span>

                    <button
                      className={styles.editBtn}
                      onClick={() => openEditModal(appointment)}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>

        {editingAppointment && (
          <div className={styles.modalOverlay}>
            <form
              className={styles.modalCard}
              onSubmit={handleUpdateAppointment}
            >
              <div className={styles.modalHeader}>
                <h2>Edit Appointment</h2>

                <button type="button" onClick={closeEditModal}>
                  ×
                </button>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Date
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                  />
                </label>

                <label>
                  Time
                  <input
                    type="time"
                    name="time"
                    value={editForm.time}
                    onChange={handleEditChange}
                    required
                  />
                </label>

                <label>
                  Treatment
                  <input
                    type="text"
                    name="treatmentType"
                    value={editForm.treatmentType}
                    onChange={handleEditChange}
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className={styles.fullField}>
                  Notes
                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    placeholder="Appointment notes..."
                  />
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeEditModal}>
                  Cancel
                </button>

                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManagerAppointments;
