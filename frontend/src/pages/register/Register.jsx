import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./register.module.css";
import { FaTooth } from "react-icons/fa";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[\p{L}\s'-]+$/u;
const ID_REGEX = /^\d{9}$/;

const isValidPhone = (phone) => {
  if (!phone) {
    return true;
  }

  const normalizedPhone = phone.replace(/[\s()-]/g, "");

  return (
    /^0\d{8,9}$/.test(normalizedPhone) || /^\+972\d{8,9}$/.test(normalizedPhone)
  );
};

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

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setError("");
  };

  const validateForm = () => {
    const newErrors = {};

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const idNumber = form.idNumber.trim();

    if (!firstName) {
      newErrors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      newErrors.firstName = "First name must contain at least 2 characters";
    } else if (!NAME_REGEX.test(firstName)) {
      newErrors.firstName = "First name can contain letters only";
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Last name must contain at least 2 characters";
    } else if (!NAME_REGEX.test(lastName)) {
      newErrors.lastName = "Last name can contain letters only";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.phone && !isValidPhone(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (form.birthDate) {
      const birthDate = new Date(`${form.birthDate}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
        newErrors.birthDate = "Please enter a valid birth date";
      }
    }

    if (!idNumber) {
      newErrors.idNumber = "ID number is required";
    } else if (!ID_REGEX.test(idNumber)) {
      newErrors.idNumber = "ID number must contain exactly 9 digits";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!PASSWORD_REGEX.test(form.password)) {
      newErrors.password =
        "Password must be 6-8 characters and include an uppercase letter and a number";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        birthDate: form.birthDate,
        idNumber: form.idNumber.trim(),
      });

      setSuccess("Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      const message = err.response?.data?.message || "Register failed";

      const field = err.response?.data?.field;

      if (field) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          [field]: message,
        }));
        return;
      }

      setError(message);
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

        <form className={styles.form} onSubmit={handleRegister} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>

              <input
                className={`${styles.input} ${
                  errors.firstName ? styles.inputError : ""
                }`}
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
              />

              {errors.firstName && (
                <span className={styles.fieldError}>{errors.firstName}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>

              <input
                className={`${styles.input} ${
                  errors.lastName ? styles.inputError : ""
                }`}
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
              />

              {errors.lastName && (
                <span className={styles.fieldError}>{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>

            <input
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              type="email"
              name="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
            />

            {errors.email && (
              <span className={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone Number</label>

            <input
              className={`${styles.input} ${
                errors.phone ? styles.inputError : ""
              }`}
              name="phone"
              placeholder="+972-XX-XXXXXXX"
              value={form.phone}
              onChange={handleChange}
            />

            {errors.phone && (
              <span className={styles.fieldError}>{errors.phone}</span>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Birth Date</label>

              <input
                className={`${styles.input} ${
                  errors.birthDate ? styles.inputError : ""
                }`}
                type="date"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
              />

              {errors.birthDate && (
                <span className={styles.fieldError}>{errors.birthDate}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>ID Number</label>

              <input
                className={`${styles.input} ${
                  errors.idNumber ? styles.inputError : ""
                }`}
                name="idNumber"
                inputMode="numeric"
                maxLength={9}
                placeholder="123456789"
                value={form.idNumber}
                onChange={handleChange}
              />

              {errors.idNumber && (
                <span className={styles.fieldError}>{errors.idNumber}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>

            <input
              className={`${styles.input} ${
                errors.password ? styles.inputError : ""
              }`}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />

            <span className={styles.hint}>
              6-8 characters, including at least one uppercase letter and one
              number
            </span>

            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>

            <input
              className={`${styles.input} ${
                errors.confirmPassword ? styles.inputError : ""
              }`}
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            {errors.confirmPassword && (
              <span className={styles.fieldError}>
                {errors.confirmPassword}
              </span>
            )}
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
