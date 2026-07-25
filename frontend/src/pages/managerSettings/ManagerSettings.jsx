import { useEffect, useState } from "react";
import {
  Bell,
  Clock3,
  Mail,
  Pencil,
  Plus,
  Settings,
  Stethoscope,
  Trash2,
} from "lucide-react";

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
    vat_percentage: "18",
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

  const [editingTreatmentId, setEditingTreatmentId] = useState(null);

  const [editTreatment, setEditTreatment] = useState({
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
        vat_percentage: settingsRes.data?.vat_percentage || "18",
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

    const vatPercentage = Number(settings.vat_percentage);

    if (
      Number.isNaN(vatPercentage) ||
      vatPercentage < 0 ||
      vatPercentage > 100
    ) {
      setError("VAT percentage must be between 0 and 100");
      return;
    }

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

  const startEditingTreatment = (item) => {
    setEditingTreatmentId(item.id);

    setEditTreatment({
      name: item.name || "",
      durationMinutes: item.duration_minutes || "",
      price: item.price || "",
    });

    setError("");
    setSuccess("");
  };

  const handleEditTreatmentChange = (e) => {
    setEditTreatment({
      ...editTreatment,
      [e.target.name]: e.target.value,
    });
  };

  const cancelEditingTreatment = () => {
    setEditingTreatmentId(null);

    setEditTreatment({
      name: "",
      durationMinutes: "",
      price: "",
    });
  };

  const updateTreatmentType = async (id) => {
    setError("");
    setSuccess("");

    if (!editTreatment.name.trim()) {
      setError("Treatment name is required");
      return;
    }

    if (
      !editTreatment.durationMinutes ||
      Number(editTreatment.durationMinutes) <= 0
    ) {
      setError("Treatment duration must be greater than zero");
      return;
    }

    if (editTreatment.price === "" || Number(editTreatment.price) < 0) {
      setError("Treatment price cannot be negative");
      return;
    }

    try {
      await api.put(`/settings/treatment-types/${id}`, {
        name: editTreatment.name,
        durationMinutes: Number(editTreatment.durationMinutes),
        price: Number(editTreatment.price),
      });

      setSuccess("Treatment type updated successfully");
      cancelEditingTreatment();
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update treatment type",
      );
    }
  };

  const deleteTreatmentType = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this treatment type?",
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/settings/treatment-types/${id}`);

      setSuccess("Treatment type deleted successfully");

      if (editingTreatmentId === id) {
        cancelEditingTreatment();
      }

      loadData();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete treatment type",
      );
    }
  };

  const calculatePriceBeforeVat = (price) => {
    const totalPrice = Number(price || 0);
    const vatPercentage = Number(settings.vat_percentage || 0);

    if (vatPercentage <= 0) {
      return totalPrice;
    }

    return totalPrice / (1 + vatPercentage / 100);
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
                type="button"
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
                <h3>Automatic Invoicing</h3>
                <p>Generate invoices after appointments</p>
              </div>

              <button
                type="button"
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
              <Settings size={21} />

              <div>
                <h2>VAT Settings</h2>
                <p>Set the VAT percentage included in treatment prices</p>
              </div>
            </div>

            <div className={styles.field}>
              <label>VAT Percentage (%)</label>

              <input
                type="number"
                name="vat_percentage"
                value={settings.vat_percentage}
                onChange={handleSettingChange}
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <button className={styles.primaryBtn} onClick={saveSettings}>
              Save VAT
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
                min="1"
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price including VAT"
                value={newTreatment.price}
                onChange={handleTreatmentChange}
                min="0"
              />

              <button type="submit">
                <Plus size={17} />
                Add
              </button>
            </form>

            <div className={styles.treatmentList}>
              {treatmentTypes.map((item) => (
                <div className={styles.treatmentItem} key={item.id}>
                  {editingTreatmentId === item.id ? (
                    <div className={styles.treatmentEditForm}>
                      <input
                        name="name"
                        value={editTreatment.name}
                        onChange={handleEditTreatmentChange}
                        placeholder="Treatment name"
                      />

                      <input
                        type="number"
                        name="durationMinutes"
                        value={editTreatment.durationMinutes}
                        onChange={handleEditTreatmentChange}
                        placeholder="Duration in minutes"
                        min="1"
                      />

                      <input
                        type="number"
                        name="price"
                        value={editTreatment.price}
                        onChange={handleEditTreatmentChange}
                        placeholder="Price including VAT"
                        min="0"
                      />

                      <div className={styles.editActions}>
                        <button
                          type="button"
                          className={styles.saveTreatmentBtn}
                          onClick={() => updateTreatmentType(item.id)}
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          className={styles.cancelTreatmentBtn}
                          onClick={cancelEditingTreatment}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.duration_minutes} minutes</p>

                        <p>
                          ₪{calculatePriceBeforeVat(item.price).toFixed(2)}{" "}
                          before VAT
                        </p>
                      </div>

                      <div className={styles.treatmentRight}>
                        <span className={styles.treatmentPrice}>
                          ₪{Number(item.price || 0).toFixed(2)} including VAT
                        </span>

                        <div className={styles.treatmentActions}>
                          <button
                            type="button"
                            className={styles.editTreatmentBtn}
                            onClick={() => startEditingTreatment(item)}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className={styles.deleteTreatmentBtn}
                            onClick={() => deleteTreatmentType(item.id)}
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
