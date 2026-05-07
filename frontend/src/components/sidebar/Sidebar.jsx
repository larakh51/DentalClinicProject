import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  Clock3,
  FileText,
  CreditCard,
  UserRound,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./sidebar.module.css";

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const patientLinks = [
    {
      to: "/patient-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: "/book-appointment",
      label: "Book Appointment",
      icon: <CalendarPlus size={20} />,
    },
    {
      to: "/my-appointments",
      label: "My Appointments",
      icon: <Clock3 size={20} />,
    },
    {
      to: "/medical-records",
      label: "Medical Record",
      icon: <FileText size={20} />,
    },
    {
      to: "/payments",
      label: "Payments",
      icon: <CreditCard size={20} />,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: <UserRound size={20} />,
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.brand}>
          <div className={styles.logoBox}>🦷</div>

          <div className={styles.brandText}>
            <h2>Dental Clinic</h2>
            <p>Patient Portal</p>
          </div>
        </div>

        <div className={styles.divider}></div>

        <nav className={styles.nav}>
          {user?.role === "patient" &&
            patientLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navItem} ${styles.active}`
                    : styles.navItem
                }
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.divider}></div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>

          <div className={styles.userInfo}>
            <h4>
              {user?.firstName} {user?.lastName}
            </h4>
            <p>{user?.email}</p>
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
