import { useEffect, useState } from "react";
import { Mail, Phone, UserPlus, Search, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerStaff.module.css";

function ManagerStaff() {
  const { user } = useAuth();

  const [staff, setStaff] = useState([]);
  const [appointmentCounts, setAppointmentCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
  });

  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadAppointmentCounts = async () => {
    try {
      const res = await api.get("/appointments/doctor-counts");

      setAppointmentCounts(res.data || {});
    } catch (err) {
      console.log(
        "Failed to load appointment counts",
        err.response?.data || err,
      );
    }
  };

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await api.get("/users");
        setStaff(res.data || []);
      } catch (err) {
        console.log("Failed to load staff", err);
        setError("Failed to load staff");
        setStaff([]);
      }
    };

    loadStaff();
    loadAppointmentCounts();

    const appointmentCountInterval = setInterval(() => {
      loadAppointmentCounts();
    }, 2000);

    return () => {
      clearInterval(appointmentCountInterval);
    };
  }, []);

  const filteredStaff = staff.filter((employee) => {
    const search = searchTerm.toLowerCase();

    const fullName = `${employee.first_name || ""} ${
      employee.last_name || ""
    }`.toLowerCase();

    const email = String(employee.email || "").toLowerCase();
    const phone = String(employee.phone || "").toLowerCase();
    const role = String(employee.role || "").toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      role.includes(search)
    );
  });

  const doctors = filteredStaff.filter(
    (employee) => employee.role === "doctor",
  );

  const managers = filteredStaff.filter(
    (employee) => employee.role === "manager",
  );

  const getInitials = (employee) => {
    const first = employee.first_name?.[0] || "";
    const last = employee.last_name?.[0] || "";

    return `${first}${last}`;
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setEditForm({
      firstName: employee.first_name || "",
      lastName: employee.last_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role || "",
    });
  };

  const closeEditModal = () => {
    setEditingEmployee(null);

    setEditForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    if (!editingEmployee?.id) return;

    try {
      await api.put(`/users/${editingEmployee.id}`, editForm);

      setStaff((prev) =>
        prev.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...employee,
                first_name: editForm.firstName,
                last_name: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                role: editForm.role,
              }
            : employee,
        ),
      );

      closeEditModal();
    } catch (err) {
      console.log("Failed to update employee", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update employee",
      );
    }
  };

  const openScheduleModal = async (doctor) => {
    setScheduleDoctor(doctor);
    setDoctorAppointments([]);
    setScheduleLoading(true);

    try {
      const res = await api.get(`/appointments?doctorId=${doctor.id}`);

      setDoctorAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Failed to load doctor schedule", err);
      setError("Failed to load doctor schedule");
      setDoctorAppointments([]);
    } finally {
      setScheduleLoading(false);
    }
  };

  const closeScheduleModal = () => {
    setScheduleDoctor(null);
    setDoctorAppointments([]);
    setScheduleLoading(false);
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatTime = (time) => {
    if (!time) return "";

    return String(time).slice(0, 5);
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
              <h1>Staff Management</h1>
              <p>Manage clinic employees</p>
            </div>

            <button
              className={styles.addBtn}
              onClick={() => navigate("/manager-add-employee")}
            >
              <UserPlus size={17} />
              Add Employee
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={19} />

            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Dentists</h2>
              <p>{doctors.length} active dentists</p>
            </div>

            {doctors.length === 0 ? (
              <div className={styles.emptyBox}>No dentists found</div>
            ) : (
              <div className={styles.doctorsGrid}>
                {doctors.map((doctor) => (
                  <div className={styles.employeeCard} key={doctor.id}>
                    <div className={styles.employeeTop}>
                      <div className={styles.avatar}>{getInitials(doctor)}</div>

                      <div>
                        <div className={styles.nameRow}>
                          <h3>
                            Dr. {doctor.first_name} {doctor.last_name}
                          </h3>

                          <span className={styles.activeBadge}>
                            {doctor.status || "active"}
                          </span>
                        </div>

                        <p>Dentist</p>
                      </div>
                    </div>

                    <div className={styles.contactInfo}>
                      <div>
                        <Mail size={17} />
                        <span>{doctor.email}</span>
                      </div>

                      <div>
                        <Phone size={17} />
                        <span>{doctor.phone || "Not provided"}</span>
                      </div>
                    </div>

                    <div className={styles.appointmentCount}>
                      <div>
                        <CalendarDays size={17} />
                        <span>Total Appointments</span>
                      </div>

                      <strong>{appointmentCounts[doctor.id] || 0}</strong>
                    </div>

                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(doctor)}
                      >
                        Edit
                      </button>

                      <button
                        className={styles.scheduleBtn}
                        onClick={() => openScheduleModal(doctor)}
                      >
                        View Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Administrative Staff</h2>
              <p>{managers.length} managers</p>
            </div>

            {managers.length === 0 ? (
              <div className={styles.emptyBox}>No managers found</div>
            ) : (
              <div className={styles.adminList}>
                {managers.map((manager) => (
                  <div className={styles.adminItem} key={manager.id}>
                    <div className={styles.adminLeft}>
                      <div
                        className={`${styles.avatar} ${styles.managerAvatar}`}
                      >
                        {getInitials(manager)}
                      </div>

                      <div>
                        <h3>
                          {manager.first_name} {manager.last_name}
                        </h3>

                        <p>{manager.email}</p>
                      </div>
                    </div>

                    <button
                      className={styles.smallEditBtn}
                      onClick={() => openEditModal(manager)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>

        {editingEmployee && (
          <div className={styles.modalOverlay}>
            <form className={styles.modalCard} onSubmit={handleUpdateEmployee}>
              <div className={styles.modalHeader}>
                <h2>Edit Employee</h2>

                <button type="button" onClick={closeEditModal}>
                  ×
                </button>
              </div>

              <div className={styles.formGrid}>
                <label>
                  First Name
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                    required
                  />
                </label>

                <label>
                  Last Name
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                  />
                </label>

                <label>
                  Role
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="doctor">Doctor</option>
                    <option value="manager">Manager</option>
                  </select>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeEditModal}>
                  Cancel
                </button>

                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {scheduleDoctor && (
          <div className={styles.modalOverlay}>
            <div className={styles.scheduleModalCard}>
              <div className={styles.modalHeader}>
                <h2>
                  Dr. {scheduleDoctor.first_name} {scheduleDoctor.last_name}{" "}
                  Schedule
                </h2>

                <button type="button" onClick={closeScheduleModal}>
                  ×
                </button>
              </div>

              {scheduleLoading ? (
                <div className={styles.emptyBox}>Loading schedule...</div>
              ) : doctorAppointments.length === 0 ? (
                <div className={styles.emptyBox}>No appointments found</div>
              ) : (
                <div className={styles.scheduleTable}>
                  <div className={styles.scheduleTableHead}>
                    <span>Date</span>
                    <span>Time</span>
                    <span>Patient</span>
                    <span>Treatment</span>
                    <span>Status</span>
                  </div>

                  {doctorAppointments.map((appointment) => (
                    <div
                      className={styles.scheduleTableRow}
                      key={appointment.id}
                    >
                      <span>{formatDate(appointment.date)}</span>

                      <span>{formatTime(appointment.time)}</span>

                      <span>
                        {appointment.patient_name || "Unknown patient"}
                      </span>

                      <span>
                        {appointment.treatment_type || "Not provided"}
                      </span>

                      <span
                        className={`${styles.scheduleStatus} ${
                          styles[appointment.status] || ""
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManagerStaff;
