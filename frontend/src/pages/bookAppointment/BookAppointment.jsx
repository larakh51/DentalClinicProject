import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./bookAppointment.module.css";

const TIME_SLOTS = [
  "09:00",
  "09:10",
  "09:20",
  "09:30",
  "09:40",
  "09:50",
  "10:00",
  "10:10",
  "10:20",
  "10:30",
  "10:40",
  "10:50",
  "11:00",
  "11:10",
  "11:20",
  "11:30",
  "11:40",
  "11:50",
  "12:00",
  "12:10",
  "12:20",
  "12:30",
  "12:40",
  "12:50",
  "13:00",
  "13:10",
  "13:20",
  "13:30",
  "13:40",
  "13:50",
  "14:00",
  "14:10",
  "14:20",
  "14:30",
  "14:40",
  "14:50",
  "15:00",
  "15:10",
  "15:20",
  "15:30",
  "15:40",
  "15:50",
  "16:00",
  "16:10",
  "16:20",
  "16:30",
  "16:40",
  "16:50",
  "17:00",
  "17:10",
  "17:20",
  "17:30",
  "17:40",
  "17:50",
  "18:00",
  "18:10",
  "18:20",
  "18:30",
  "18:40",
  "18:50",
];

function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isPatient = user?.role === "patient";
  const isManager = user?.role === "manager";
  const isDoctor = user?.role === "doctor";

  const [doctors, setDoctors] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const [form, setForm] = useState({
    patientIdNumber: "",
    treatmentTypeId: "",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const selectedDoctor = isDoctor
    ? {
        id: user?.id,
        first_name: user?.firstName,
        last_name: user?.lastName,
      }
    : doctors.find((doctor) => doctor.id === form.doctorId);

  const selectedTreatment = treatmentTypes.find(
    (treatment) => treatment.id === form.treatmentTypeId,
  );

  const isPatientSelected = isPatient || Boolean(form.patientIdNumber.trim());

  const isFormComplete =
    isPatientSelected &&
    form.treatmentTypeId &&
    form.doctorId &&
    form.date &&
    form.time;

  const timeToMinutes = (time) => {
    if (!time) return 0;

    const cleanTime = String(time).slice(0, 5);
    const [hours, minutes] = cleanTime.split(":").map(Number);

    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  };

  const isPastSlot = (slot) => {
    if (!form.date) return false;

    if (form.date < today) return true;

    if (form.date === today) {
      const now = new Date();

      const currentTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return slot <= currentTime;
    }

    return false;
  };

  const getSlotConflict = (slot) => {
    if (!selectedTreatment) return null;

    const newStart = timeToMinutes(slot);
    const duration = Number(selectedTreatment.duration_minutes || 30);
    const newEnd = newStart + duration;

    return bookedAppointments.find((appointment) => {
      if (String(appointment.status).toLowerCase() === "cancelled") {
        return false;
      }

      const existingStart = timeToMinutes(appointment.time);

      const existingEnd = appointment.end_time
        ? timeToMinutes(appointment.end_time)
        : existingStart + Number(appointment.duration_minutes || 30);

      return existingStart < newEnd && existingEnd > newStart;
    });
  };

  const isSlotBooked = (slot) => {
    return Boolean(getSlotConflict(slot));
  };

  const isSlotDisabled = (slot) => {
    return isPastSlot(slot) || isSlotBooked(slot);
  };

  const getSlotLabel = (slot) => {
    if (isPastSlot(slot)) {
      return `${slot} - Past`;
    }

    const conflict = getSlotConflict(slot);

    if (conflict) {
      const start = String(conflict.time).slice(0, 5);

      const end = conflict.end_time
        ? String(conflict.end_time).slice(0, 5)
        : minutesToTime(
            timeToMinutes(conflict.time) +
              Number(conflict.duration_minutes || 30),
          );

      return `${slot} - Booked (${start}-${end})`;
    }

    return slot;
  };

  const availableTimeSlots = TIME_SLOTS.map((slot) => ({
    time: slot,
    disabled: isSlotDisabled(slot),
    label: getSlotLabel(slot),
  }));

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const [doctorsRes, treatmentTypesRes] = await Promise.all([
          api.get("/users/doctors"),
          api.get("/settings/treatment-types"),
        ]);

        setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);

        setTreatmentTypes(
          Array.isArray(treatmentTypesRes.data) ? treatmentTypesRes.data : [],
        );
      } catch (err) {
        console.log("Failed to load booking data", err.response?.data || err);

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load booking data",
        );

        setDoctors([]);
        setTreatmentTypes([]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isDoctor || !user?.id) return;

    setForm((prev) => ({
      ...prev,
      doctorId: user.id,
    }));
  }, [isDoctor, user?.id]);

  useEffect(() => {
    const loadBookedAppointments = async () => {
      if (!form.doctorId || !form.date) {
        setBookedAppointments([]);
        return;
      }

      setLoadingSlots(true);

      try {
        const params = new URLSearchParams({
          doctorId: form.doctorId,
          date: form.date,
        });

        const res = await api.get(`/appointments?${params.toString()}`);

        setBookedAppointments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(
          "Failed to load booked appointments",
          err.response?.data || err,
        );

        setBookedAppointments([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadBookedAppointments();
  }, [form.doctorId, form.date]);

  useEffect(() => {
    if (!form.time) return;

    if (isSlotDisabled(form.time)) {
      setForm((prev) => ({
        ...prev,
        time: "",
      }));
    }
  }, [bookedAppointments, form.treatmentTypeId, form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: value,
      };

      if (["treatmentTypeId", "doctorId", "date"].includes(name)) {
        nextForm.time = "";
      }

      return nextForm;
    });
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price || 0);

    if (numericPrice <= 0) return "";

    return ` - ₪${numericPrice}`;
  };

  const getCancelPath = () => {
    if (isManager) return "/manager-appointments";
    if (isDoctor) return "/doctor-schedule";

    return "/patient-dashboard";
  };

  const getSuccessPath = () => {
    if (isManager) return "/manager-appointments";
    if (isDoctor) return "/doctor-schedule";

    return "/my-appointments";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("You must be logged in to book an appointment");
      return;
    }

    if (!isPatient && !form.patientIdNumber.trim()) {
      setError("Please enter the patient ID number");
      return;
    }

    if (!selectedTreatment) {
      setError("Please select a treatment type");
      return;
    }

    if (!selectedDoctor) {
      setError("Please select a doctor");
      return;
    }

    if (!form.date || !form.time) {
      setError("Please select date and time");
      return;
    }

    if (isSlotDisabled(form.time)) {
      setError("This time slot is not available");
      return;
    }

    try {
      let appointmentPatient = {
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
      };

      if (!isPatient) {
        const patientRes = await api.get(
          `/users/patient-by-id-number/${encodeURIComponent(
            form.patientIdNumber.trim(),
          )}`,
        );

        appointmentPatient = patientRes.data;
      }

      await api.post("/appointments", {
        patientId: appointmentPatient.id,
        patientName: `${appointmentPatient.first_name} ${appointmentPatient.last_name}`,
        doctorId: form.doctorId,
        doctorName: `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`,
        date: form.date,
        time: form.time,
        treatmentTypeId: form.treatmentTypeId,
        notes: form.notes,
      });

      setSuccess("Appointment booked successfully");

      setForm({
        patientIdNumber: "",
        treatmentTypeId: "",
        doctorId: isDoctor ? user.id : "",
        date: "",
        time: "",
        notes: "",
      });

      setBookedAppointments([]);

      setTimeout(() => {
        navigate(getSuccessPath());
      }, 1000);
    } catch (err) {
      console.log("BOOK APPOINTMENT ERROR:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to book appointment",
      );
    }
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
            <h1>Book Appointment</h1>
            <p>Schedule your next dental visit</p>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => navigate(-1)}
            >
              Back to My Schedule
            </button>
          </div>

          <section className={styles.formCard}>
            <div className={styles.cardHeader}>
              <h2>Appointment Details</h2>
              <p>Fill in the information below to book your appointment</p>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}
            {success && <div className={styles.successBox}>{success}</div>}

            {loadingData && (
              <div className={styles.successBox}>Loading booking data...</div>
            )}

            {!loadingData && treatmentTypes.length === 0 && (
              <div className={styles.errorBox}>
                No treatment types found. Please add treatments from Manager
                Settings first.
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              {!isPatient && (
                <div className={styles.field}>
                  <label>Patient ID Number *</label>

                  <input
                    type="text"
                    name="patientIdNumber"
                    value={form.patientIdNumber}
                    onChange={handleChange}
                    placeholder="Enter patient ID number"
                    required
                  />
                </div>
              )}

              <div className={styles.field}>
                <label>Treatment Type *</label>

                <select
                  name="treatmentTypeId"
                  value={form.treatmentTypeId}
                  onChange={handleChange}
                  required
                  disabled={loadingData || treatmentTypes.length === 0}
                >
                  <option value="">
                    {loadingData
                      ? "Loading treatment types..."
                      : "Select treatment type"}
                  </option>

                  {treatmentTypes.map((treatment) => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.name} - {treatment.duration_minutes} min
                      {formatPrice(treatment.price)}
                    </option>
                  ))}
                </select>
              </div>

              {!isDoctor && (
                <div className={styles.field}>
                  <label>Select Doctor *</label>

                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    required
                    disabled={loadingData}
                  >
                    <option value="">Choose your preferred doctor</option>

                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.field}>
                <label>Select Date *</label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Select Time *</label>

                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  disabled={
                    loadingData ||
                    loadingSlots ||
                    !form.doctorId ||
                    !form.date ||
                    !form.treatmentTypeId
                  }
                >
                  <option value="">
                    {loadingSlots
                      ? "Loading available times..."
                      : "Choose time slot"}
                  </option>

                  {availableTimeSlots.map((slot) => (
                    <option
                      key={slot.time}
                      value={slot.time}
                      disabled={slot.disabled}
                    >
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Additional Notes (Optional)</label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements or concerns..."
                />
              </div>

              {isFormComplete && (
                <div className={styles.summaryBox}>
                  <h3>Appointment Summary</h3>

                  <p>
                    <strong>Treatment:</strong> {selectedTreatment?.name}
                  </p>

                  <p>
                    <strong>Duration:</strong>{" "}
                    {selectedTreatment?.duration_minutes} minutes
                  </p>

                  <p>
                    <strong>Doctor:</strong> Dr. {selectedDoctor?.first_name}{" "}
                    {selectedDoctor?.last_name}
                  </p>

                  <p>
                    <strong>Date & Time:</strong>{" "}
                    {new Date(form.date).toLocaleDateString("en-GB")} at{" "}
                    {form.time}
                  </p>

                  {Number(selectedTreatment?.price || 0) > 0 && (
                    <p>
                      <strong>Price:</strong> ₪
                      {Number(selectedTreatment?.price || 0)}
                    </p>
                  )}
                </div>
              )}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                  disabled={loadingData || treatmentTypes.length === 0}
                >
                  <CalendarDays size={17} />
                  Confirm Booking
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate(getCancelPath())}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          {isPatient && (
            <section className={styles.infoCard}>
              <h3>📌 Important:</h3>

              <ul>
                <li>Please arrive 10 minutes before your appointment</li>
                <li>Bring your insurance card and ID</li>
                <li>Cancel at least 24 hours in advance to avoid fees</li>
                <li>You will receive a confirmation SMS and email</li>
              </ul>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default BookAppointment;
