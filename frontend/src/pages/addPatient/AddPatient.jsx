import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./addPatient.module.css";

function AddPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    idNumber: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", form);

      setSuccess("Patient added successfully");

      setTimeout(() => {
        navigate("/manager-patients");
      }, 700);
    } catch (error) {
      console.log("Failed to add patient", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add patient",
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
          <div className={styles.headerRow}>
            <div>
              <h1>Add Patient</h1>
              <p>Create a new patient account</p>
            </div>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => navigate("/manager-patients")}
            >
              Back to Patients
            </button>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <UserPlus size={22} />
              </div>

              <div>
                <h2>Patient Information</h2>
                <p>Fill in the patient details below</p>
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}
            {success && <div className={styles.successBox}>{success}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <label>
                  First Name
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Last Name
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Birth Date
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  ID Number
                  <input
                    type="text"
                    name="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className={styles.fullField}>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate("/manager-patients")}
                >
                  Cancel
                </button>

                <button type="submit" className={styles.saveBtn}>
                  Add Patient
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

export default AddPatient;
