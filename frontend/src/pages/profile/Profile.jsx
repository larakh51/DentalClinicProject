import { useState } from "react";
import { UserRound, Mail, Phone, Lock, Shield, Trash2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./profile.module.css";

function Profile() {
  const { user, checkAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    try {
      await api.put(`/users/${user.id}`, form);
      await checkAuth();

      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update profile",
      );
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.userCircle}>{initials}</div>
        </header>

        <section className={styles.content}>
          <div className={styles.pageHeader}>
            <h1>My Profile</h1>
            <p>Manage your account settings</p>
          </div>

          <section className={styles.profileCard}>
            <div className={styles.bigAvatar}>{initials}</div>

            <div>
              <h2>
                {user?.firstName} {user?.lastName}
              </h2>
              <p>{user?.email}</p>

              <button className={styles.avatarBtn}>Change Avatar</button>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h2>Personal Information</h2>
                <p>Update your account details</p>
              </div>

              {!isEditing ? (
                <button
                  className={styles.darkBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    Save
                  </button>

                  <button className={styles.cancelBtn} onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}
            {success && <div className={styles.successBox}>{success}</div>}

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>First Name</label>

                <div className={styles.inputBox}>
                  <UserRound size={17} />
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Last Name</label>

                <div className={styles.inputBox}>
                  <UserRound size={17} />
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label>Email Address</label>

              <div className={styles.inputBox}>
                <Mail size={17} />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>

              <div className={styles.inputBox}>
                <Phone size={17} />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+972-54-1234567"
                />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.securityHeader}>
              <Lock size={23} />
              <div>
                <h2>Security</h2>
                <p>Manage your password and security settings</p>
              </div>
            </div>

            <div className={styles.securityItem}>
              <div>
                <h3>Password</h3>
                <p>Last changed 3 months ago</p>
              </div>

              <button className={styles.outlineBtn}>Change Password</button>
            </div>

            <div className={styles.securityItem}>
              <div>
                <h3>Two-Factor Authentication</h3>
                <p>Not enabled</p>
              </div>

              <button className={styles.outlineBtn}>Enable</button>
            </div>
          </section>

          <section className={styles.dangerCard}>
            <h2>Danger Zone</h2>
            <p>Irreversible actions</p>

            <div className={styles.dangerBox}>
              <div>
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all data</p>
              </div>

              <button className={styles.deleteBtn}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Profile;
