import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Filter, Search } from "lucide-react";
import DatePicker from "react-datepicker";
import { HebrewCalendar, flags } from "@hebcal/core";
import "react-datepicker/dist/react-datepicker.css";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import AppModal from "../../components/appModal/AppModal";
import styles from "./managerAppointments.module.css";

const APPOINTMENTS_PER_PAGE = 7;

const CLINIC_CLOSING_TIME = "19:00";
const SHORT_DAY_CLOSING_TIME = "14:00";

const normalizeCalendarDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  );
};

const isClosedIsraeliHolidayEvent = (event) => {
  const description = String(event.getDesc() || "").replaceAll("’", "'");

  return (
    Boolean(event.getFlags() & flags.CHAG) ||
    description === "Yom Kippur" ||
    description === "Yom HaAtzma'ut" ||
    description === "Yom HaAtzmaut"
  );
};

const isIsraeliHoliday = (date) => {
  const normalizedDate = normalizeCalendarDate(date);

  if (!normalizedDate) {
    return false;
  }

  const events = HebrewCalendar.getHolidaysOnDate(normalizedDate, true) || [];

  return events.some(isClosedIsraeliHolidayEvent);
};

const isIsraeliHolidayEve = (date) => {
  const normalizedDate = normalizeCalendarDate(date);

  if (!normalizedDate) {
    return false;
  }

  const nextDate = new Date(normalizedDate);
  nextDate.setDate(nextDate.getDate() + 1);

  return isIsraeliHoliday(nextDate);
};

function ManagerAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const formatInputDate = (date) => {
    if (!date) return "";

    const dateValue = String(date);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    const normalizedDate = formatInputDate(date);

    if (!normalizedDate) return "";

    const [year, month, day] = normalizedDate.split("-");

    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    if (!time) return "";
    return String(time).slice(0, 5);
  };

  const timeToMinutes = (time) => {
    if (!time) return 0;

    const cleanTime = String(time).slice(0, 5);
    const [hours, minutes] = cleanTime.split(":").map(Number);

    return hours * 60 + minutes;
  };

  const getEditSelectedDate = () => {
    if (!editForm.date) {
      return null;
    }

    const [year, month, day] = editForm.date.split("-").map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const selectedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime())) {
      return null;
    }

    return selectedDate;
  };

  const getEditClinicClosingTime = () => {
    const selectedDate = getEditSelectedDate();

    if (
      selectedDate &&
      (selectedDate.getDay() === 5 || isIsraeliHolidayEve(selectedDate))
    ) {
      return SHORT_DAY_CLOSING_TIME;
    }

    return CLINIC_CLOSING_TIME;
  };

  const doesEditedAppointmentEndAfterClosing = () => {
    if (!editForm.time || !editForm.date) {
      return false;
    }

    const startMinutes = timeToMinutes(editForm.time);

    const durationMinutes = Number(editingAppointment?.duration_minutes || 30);

    const endMinutes = startMinutes + durationMinutes;

    const closingMinutes = timeToMinutes(getEditClinicClosingTime());

    return endMinutes > closingMinutes;
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

  const totalPages = Math.ceil(
    filteredAppointments.length / APPOINTMENTS_PER_PAGE,
  );

  const firstAppointmentIndex = (currentPage - 1) * APPOINTMENTS_PER_PAGE;

  const lastAppointmentIndex = firstAppointmentIndex + APPOINTMENTS_PER_PAGE;

  const paginatedAppointments = filteredAppointments.slice(
    firstAppointmentIndex,
    lastAppointmentIndex,
  );

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
    setCancelModalOpen(false);

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

  const handleEditDateChange = (date) => {
    if (!date) {
      setEditForm((prev) => ({
        ...prev,
        date: "",
      }));

      return;
    }

    if (date.getDay() === 6 || isIsraeliHoliday(date)) {
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      date: formatInputDate(date),
    }));

    setError("");
  };

  const canCompleteEditedAppointment = () => {
    if (!editForm.date || !editForm.time) {
      return false;
    }

    const appointmentDateTime = new Date(`${editForm.date}T${editForm.time}`);

    if (Number.isNaN(appointmentDateTime.getTime())) {
      return false;
    }

    return appointmentDateTime <= new Date();
  };

  const saveAppointmentChanges = async () => {
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

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();

    if (!editingAppointment?.id) return;

    if (editForm.status !== "cancelled") {
      const selectedDate = getEditSelectedDate();

      if (!selectedDate) {
        setError("Please select a valid appointment date");
        return;
      }

      if (selectedDate.getDay() === 6) {
        setError("The clinic is closed on Saturday");
        return;
      }

      if (isIsraeliHoliday(selectedDate)) {
        setError("The clinic is closed on this holiday");
        return;
      }

      if (doesEditedAppointmentEndAfterClosing()) {
        setError(
          `The appointment must end before the clinic closes at ${getEditClinicClosingTime()}`,
        );

        return;
      }
    }

    if (
      editForm.status === "cancelled" &&
      editingAppointment.status !== "cancelled"
    ) {
      setCancelModalOpen(true);
      return;
    }

    await saveAppointmentChanges();
  };

  const confirmCancelAppointment = async () => {
    setCancelModalOpen(false);
    await saveAppointmentChanges();
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
                paginatedAppointments.map((appointment) => (
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

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.paginationArrow}
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        currentPage === pageNumber
                          ? `${styles.pageButton} ${styles.activePage}`
                          : styles.pageButton
                      }
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className={styles.paginationArrow}
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  ›
                </button>
              </div>
            )}
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
                  <DatePicker
                    selected={
                      editForm.date
                        ? new Date(`${editForm.date}T12:00:00`)
                        : null
                    }
                    onChange={handleEditDateChange}
                    filterDate={(date) =>
                      date.getDay() !== 6 && !isIsraeliHoliday(date)
                    }
                    dateFormat="yyyy-MM-dd"
                    name="date"
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

                    <option
                      value="completed"
                      disabled={
                        editForm.status !== "completed" &&
                        !canCompleteEditedAppointment()
                      }
                    >
                      Completed
                    </option>

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

      <AppModal
        open={cancelModalOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Yes, Cancel"
        cancelText="Keep Appointment"
        showCancel
        danger
        onConfirm={confirmCancelAppointment}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}

export default ManagerAppointments;
