import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Mail, Phone, Lock, Shield, Trash2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./profile.module.css";

function Profile() {
  const { user, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  useEffect(() => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setAvatarPreview(user?.avatar || "");

    if (user?.id) {
      const savedTwoFactor = localStorage.getItem(`twoFactor-${user.id}`);
      setTwoFactorEnabled(savedTwoFactor === "true");
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
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

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const avatar = reader.result;

        setAvatarPreview(avatar);

        await api.put(`/users/${user.id}`, {
          avatar,
        });

        await checkAuth();

        setSuccess("Avatar updated successfully");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to update avatar",
        );
      }
    };

    reader.readAsDataURL(file);
  };

  const openPasswordModal = () => {
    setError("");
    setSuccess("");
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.put(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      closePasswordModal();
      setSuccess("Password changed successfully");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to change password",
      );
    }
  };

  const handleToggleTwoFactor = () => {
    setError("");
    setSuccess("");

    const nextValue = !twoFactorEnabled;

    setTwoFactorEnabled(nextValue);

    if (user?.id) {
      localStorage.setItem(`twoFactor-${user.id}`, String(nextValue));
    }

    setSuccess(
      nextValue
        ? "Two-factor authentication enabled"
        : "Two-factor authentication disabled",
    );
  };

  const handleDeleteAccount = async () => {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/users/${user.id}`);

      await logout();
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete account",
      );

      setShowDeleteModal(false);
    }
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.userCircle}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className={styles.avatarImage}
              />
            ) : (
              initials
            )}
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.pageHeader}>
            <h1>My Profile</h1>
            <p>Manage your account settings</p>
          </div>

          <section className={styles.profileCard}>
            <div className={styles.bigAvatar}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className={styles.avatarImage}
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <h2>
                {user?.firstName} {user?.lastName}
              </h2>
              <p>{user?.email}</p>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenFileInput}
                onChange={handleAvatarChange}
              />

              <button
                type="button"
                className={styles.avatarBtn}
                onClick={handleAvatarClick}
              >
                Change Avatar
              </button>
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
                  type="button"
                  className={styles.darkBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSave}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                  >
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

              <button
                type="button"
                className={styles.outlineBtn}
                onClick={openPasswordModal}
              >
                Change Password
              </button>
            </div>

            <div className={styles.securityItem}>
              <div>
                <h3>Two-Factor Authentication</h3>
                <p>{twoFactorEnabled ? "Enabled" : "Not enabled"}</p>
              </div>

              <button
                type="button"
                className={styles.outlineBtn}
                onClick={handleToggleTwoFactor}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </button>
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

              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </section>
        </section>

        {showPasswordModal && (
          <div className={styles.modalOverlay}>
            <form className={styles.modalCard} onSubmit={handleChangePassword}>
              <div className={styles.modalHeader}>
                <h2>Change Password</h2>

                <button type="button" onClick={closePasswordModal}>
                  ×
                </button>
              </div>

              <div className={styles.modalForm}>
                <label>
                  Current Password
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </label>

                <label>
                  New Password
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </label>

                <label>
                  Confirm Password
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closePasswordModal}>
                  Cancel
                </button>

                <button type="submit">Save Password</button>
              </div>
            </form>
          </div>
        )}

        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <h2>Delete Account</h2>

                <button type="button" onClick={() => setShowDeleteModal(false)}>
                  ×
                </button>
              </div>

              <p className={styles.deleteText}>
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>

                <button type="button" onClick={handleDeleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;
