import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./bookAppointment.module.css";

function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    treatmentType: "",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isFormComplete =
    form.treatmentType && form.doctorId && form.date && form.time;

  const selectedDoctor = doctors.find((doctor) => doctor.id === form.doctorId);

  const treatmentTypes = [
    "Cleaning & Check-up",
    "Filling",
    "Root Canal",
    "Tooth Extraction",
    "Whitening",
    "Consultation",
  ];

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ];

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await api.get("/users/doctors");
        setDoctors(res.data || []);
      } catch (error) {
        console.log("Failed to load doctors", error);
      }
    };

    loadDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("You must be logged in to book an appointment");
      return;
    }

    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === form.doctorId,
    );

    if (!selectedDoctor) {
      setError("Please select a doctor");
      return;
    }

    try {
      await api.post("/appointments", {
        patientId: user.id,
        patientName: `${user.firstName} ${user.lastName}`,
        doctorId: form.doctorId,
        doctorName: `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`,
        date: form.date,
        time: form.time,
        treatmentType: form.treatmentType,
        notes: form.notes,
      });

      setSuccess("Appointment booked successfully");

      setForm({
        treatmentType: "",
        doctorId: "",
        date: "",
        time: "",
        notes: "",
      });

      setTimeout(() => {
        navigate("/my-appointments");
      }, 1000);
    } catch (err) {
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
          </div>

          <section className={styles.formCard}>
            <div className={styles.cardHeader}>
              <h2>Appointment Details</h2>
              <p>Fill in the information below to book your appointment</p>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}
            {success && <div className={styles.successBox}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Treatment Type *</label>
                <select
                  name="treatmentType"
                  value={form.treatmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select treatment type</option>
                  {treatmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Select Doctor *</label>
                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose your preferred doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Select Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
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
                >
                  <option value="">Choose time slot</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
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
                    <strong>Treatment:</strong> {form.treatmentType}
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
                </div>
              )}

              <div className={styles.actions}>
                <button type="submit" className={styles.confirmBtn}>
                  <CalendarDays size={17} />
                  Confirm Booking
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate("/patient-dashboard")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          <section className={styles.infoCard}>
            <h3>📌 Important:</h3>
            <ul>
              <li>Please arrive 10 minutes before your appointment</li>
              <li>Bring your insurance card and ID</li>
              <li>Cancel at least 24 hours in advance to avoid fees</li>
              <li>You will receive a confirmation SMS and email</li>
            </ul>
          </section>
        </section>
      </main>
    </div>
  );
}

export default BookAppointment;
