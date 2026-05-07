import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./register.module.css";
import { FaTooth } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    idNumber: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        birthDate: form.birthDate,
        idNumber: form.idNumber,
      });

      setSuccess("Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <div className={styles.logoCircle}>
          <FaTooth className={styles.toothIcon} />
        </div>

        <h1 className={styles.title}>Create Patient Account</h1>
        <p className={styles.subtitle}>
          Register to book appointments and manage your dental health
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}
        {success && <div className={styles.successBox}>{success}</div>}

        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input
                className={styles.input}
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input
                className={styles.input}
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone Number</label>
            <input
              className={styles.input}
              name="phone"
              placeholder="+972-XX-XXXXXXX"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Birth Date</label>
              <input
                className={styles.input}
                type="date"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>ID Number</label>
              <input
                className={styles.input}
                name="idNumber"
                placeholder="123456789"
                value={form.idNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              className={styles.input}
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>

        <p className={styles.linkText}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
