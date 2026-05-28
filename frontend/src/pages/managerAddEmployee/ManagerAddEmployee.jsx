import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerAddEmployee.module.css";

function ManagerAddEmployee() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "doctor",
    idNumber: "",
    birthDate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    try {
      await api.post("/users/employees", form);

      setSuccess("Employee added successfully");

      setTimeout(() => {
        navigate("/manager-staff");
      }, 900);
    } catch (err) {
      console.log("ADD EMPLOYEE ERROR:", err.response?.data);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to add employee",
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
            <h1>Add Employee</h1>
            <p>Create a new doctor or manager account</p>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <UserPlus size={22} />
              </div>

              <div>
                <h2>Employee Details</h2>
                <p>Fill in the information below</p>
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}
            {success && <div className={styles.successBox}>{success}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>First Name *</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Last Name *</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.field}>
                  <label>Role *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="doctor">Doctor</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>ID Number</label>
                  <input
                    name="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.field}>
                  <label>Birth Date</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.saveBtn}>
                  Add Employee
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate("/manager-staff")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerAddEmployee;
