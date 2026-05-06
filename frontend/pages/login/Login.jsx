import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../src/context/AuthContext";
import styles from "./login.module.css";
import { FaTooth } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(form);

      if (user.role === "patient") navigate("/patient-dashboard");
      else if (user.role === "doctor") navigate("/doctor-dashboard");
      else if (user.role === "manager") navigate("/manager-dashboard");
      else navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.logoCircle}>
          <FaTooth className={styles.toothIcon} />
        </div>
        
        <h1 className={styles.title}>Dental Clinic System</h1>
        <p className={styles.subtitle}>Sign in to access your account</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
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

          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>

        <div className={styles.forgot}>
          <a href="#">Forgot password?</a>
        </div>

        <p className={styles.linkText}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
