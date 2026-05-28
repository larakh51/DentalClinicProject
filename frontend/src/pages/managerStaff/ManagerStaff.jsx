import { useEffect, useState } from "react";
import { Mail, Phone, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerStaff.module.css";

function ManagerStaff() {
  const { user } = useAuth();

  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
  }, []);

  const doctors = staff.filter((employee) => employee.role === "doctor");
  const managers = staff.filter((employee) => employee.role === "manager");

  const getInitials = (employee) => {
    const first = employee.first_name?.[0] || "";
    const last = employee.last_name?.[0] || "";
    return `${first}${last}`;
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

                    <div className={styles.actions}>
                      <button className={styles.editBtn}>Edit</button>
                      <button className={styles.scheduleBtn}>
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

                    <button className={styles.smallEditBtn}>Edit</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerStaff;
