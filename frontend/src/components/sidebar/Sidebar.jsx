import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  Clock3,
  FileText,
  CreditCard,
  UserRound,
  LogOut,
  UsersRound,
  BriefcaseBusiness,
  BarChart3,
  Settings,
  CalendarDays,
  UserPlus,
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

  const doctorLinks = [
    {
      to: "/doctor-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: "/doctor-schedule",
      label: "My Schedule",
      icon: <CalendarDays size={20} />,
    },
    {
      to: "/doctor-patients",
      label: "Patients",
      icon: <UsersRound size={20} />,
    },
    {
      to: "/doctor-treatments",
      label: "Treatments",
      icon: <BriefcaseBusiness size={20} />,
    },
    {
      to: "/doctor-availability",
      label: "Availability",
      icon: <Clock3 size={20} />,
    },
  ];

  const managerLinks = [
    {
      to: "/manager-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: "/manager-appointments",
      label: "Appointments",
      icon: <CalendarDays size={20} />,
    },
    {
      to: "/manager-patients",
      label: "Patients",
      icon: <UsersRound size={20} />,
    },
    {
      to: "/manager-staff",
      label: "Staff",
      icon: <BriefcaseBusiness size={20} />,
    },
    {
      to: "/manager-reports",
      label: "Reports",
      icon: <BarChart3 size={20} />,
    },
    {
      to: "/manager-finance",
      label: "Finance",
      icon: <CreditCard size={20} />,
    },
    {
      to: "/manager-settings",
      label: "Settings",
      icon: <Settings size={20} />,
    },
  ];

  const getLinksByRole = () => {
    if (user?.role === "doctor") return doctorLinks;
    if (user?.role === "manager") return managerLinks;
    return patientLinks;
  };

  const getPortalName = () => {
    if (user?.role === "doctor") return "Doctor Portal";
    if (user?.role === "manager") return "Manager Portal";
    return "Patient Portal";
  };

  const userInitials = `${user?.firstName?.[0] || ""}${
    user?.lastName?.[0] || ""
  }`;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.brand}>
          <div className={styles.logoBox}>🦷</div>

          <div className={styles.brandText}>
            <h2>Dental Clinic</h2>
            <p>{getPortalName()}</p>
          </div>
        </div>

        <div className={styles.divider}></div>

        <nav className={styles.nav}>
          {getLinksByRole().map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
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
          <div className={styles.avatar}>{userInitials}</div>

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
