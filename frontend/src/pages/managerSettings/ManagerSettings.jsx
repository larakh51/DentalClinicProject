import { useEffect, useState } from "react";
import { Bell, Clock3, Mail, Plus, Settings, Stethoscope } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerSettings.module.css";

function ManagerSettings() {
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    clinic_name: "",
    clinic_phone: "",
    clinic_address: "",
    opening_time: "09:00",
    closing_time: "17:00",
    email_notifications: "1",
    sms_reminders: "1",
    automatic_invoicing: "1",
  });

  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [newTreatment, setNewTreatment] = useState({
    name: "",
    durationMinutes: "",
    price: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const [settingsRes, treatmentTypesRes] = await Promise.all([
        api.get("/settings"),
        api.get("/settings/treatment-types"),
      ]);

      setSettings((prev) => ({
        ...prev,
        ...settingsRes.data,
      }));

      setTreatmentTypes(treatmentTypesRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load settings",
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSettingChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const toggleSetting = (key) => {
    setSettings({
      ...settings,
      [key]: settings[key] === "1" ? "0" : "1",
    });
  };

  const saveSettings = async () => {
    setError("");
    setSuccess("");

    try {
      await api.put("/settings", settings);
      setSuccess("Settings saved successfully");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to save settings",
      );
    }
  };

  const handleTreatmentChange = (e) => {
    setNewTreatment({
      ...newTreatment,
      [e.target.name]: e.target.value,
    });
  };

  const addTreatmentType = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      await api.post("/settings/treatment-types", {
        name: newTreatment.name,
        durationMinutes: Number(newTreatment.durationMinutes),
        price: Number(newTreatment.price || 0),
      });

      setNewTreatment({
        name: "",
        durationMinutes: "",
        price: "",
      });

      setSuccess("Treatment type added successfully");
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to add treatment type",
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
            <h1>System Settings</h1>
            <p>Configure clinic management system</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && <div className={styles.successBox}>{success}</div>}

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Settings size={21} />
              <div>
                <h2>Clinic Information</h2>
                <p>Update clinic details</p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Clinic Name</label>
                <input
                  name="clinic_name"
                  value={settings.clinic_name}
                  onChange={handleSettingChange}
                />
              </div>

              <div className={styles.field}>
                <label>Phone Number</label>
                <input
                  name="clinic_phone"
                  value={settings.clinic_phone}
                  onChange={handleSettingChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Address</label>
              <input
                name="clinic_address"
                value={settings.clinic_address}
                onChange={handleSettingChange}
              />
            </div>

            <button className={styles.primaryBtn} onClick={saveSettings}>
              Save Changes
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Clock3 size={21} />
              <div>
                <h2>Business Hours</h2>
                <p>Set clinic operating hours</p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Opening Time</label>
                <input
                  type="time"
                  name="opening_time"
                  value={settings.opening_time}
                  onChange={handleSettingChange}
                />
              </div>

              <div className={styles.field}>
                <label>Closing Time</label>
                <input
                  type="time"
                  name="closing_time"
                  value={settings.closing_time}
                  onChange={handleSettingChange}
                />
              </div>
            </div>

            <button className={styles.primaryBtn} onClick={saveSettings}>
              Update Hours
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Bell size={21} />
              <div>
                <h2>Notifications</h2>
                <p>Configure notification preferences</p>
              </div>
            </div>

            <div className={styles.toggleRow}>
              <div>
                <h3>Email Notifications</h3>
                <p>Receive appointment updates via email</p>
              </div>

              <button
                className={`${styles.toggle} ${
                  settings.email_notifications === "1" ? styles.on : ""
                }`}
                onClick={() => toggleSetting("email_notifications")}
              >
                <span />
              </button>
            </div>

            <div className={styles.toggleRow}>
              <div>
                <h3>SMS Reminders</h3>
                <p>Send SMS to patients 24h before appointments</p>
              </div>

              <button
                className={`${styles.toggle} ${
                  settings.sms_reminders === "1" ? styles.on : ""
                }`}
                onClick={() => toggleSetting("sms_reminders")}
              >
                <span />
              </button>
            </div>

            <div className={styles.toggleRow}>
              <div>
                <h3>Automatic Invoicing</h3>
                <p>Generate invoices after appointments</p>
              </div>

              <button
                className={`${styles.toggle} ${
                  settings.automatic_invoicing === "1" ? styles.on : ""
                }`}
                onClick={() => toggleSetting("automatic_invoicing")}
              >
                <span />
              </button>
            </div>

            <button className={styles.primaryBtn} onClick={saveSettings}>
              Save Notifications
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Stethoscope size={21} />
              <div>
                <h2>Treatment Types</h2>
                <p>Add treatments available in the clinic</p>
              </div>
            </div>

            <form className={styles.treatmentForm} onSubmit={addTreatmentType}>
              <input
                name="name"
                placeholder="Treatment name"
                value={newTreatment.name}
                onChange={handleTreatmentChange}
                required
              />

              <input
                type="number"
                name="durationMinutes"
                placeholder="Duration in minutes"
                value={newTreatment.durationMinutes}
                onChange={handleTreatmentChange}
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={newTreatment.price}
                onChange={handleTreatmentChange}
              />

              <button type="submit">
                <Plus size={17} />
                Add
              </button>
            </form>

            <div className={styles.treatmentList}>
              {treatmentTypes.map((item) => (
                <div className={styles.treatmentItem} key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.duration_minutes} minutes</p>
                  </div>

                  <span>₪{item.price}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Mail size={21} />
              <div>
                <h2>Email Templates</h2>
                <p>Customize automated emails</p>
              </div>
            </div>

            <div className={styles.templateBox}>
              Appointment Confirmation Email
            </div>
            <div className={styles.templateBox}>Appointment Reminder Email</div>
            <div className={styles.templateBox}>Invoice Email Template</div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerSettings;
