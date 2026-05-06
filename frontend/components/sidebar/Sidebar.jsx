import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  Receipt,
  Users,
} from "lucide-react";
import { useAuth } from "../../src/context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🦷</div>
        <div>
          <h2>Dental Clinic</h2>
          <p>{user?.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {user?.role === "patient" && (
          <>
            <Link to="/patient-dashboard">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/appointments">
              <CalendarDays size={18} /> Appointments
            </Link>
            <Link to="/invoices">
              <Receipt size={18} /> Invoices
            </Link>
          </>
        )}

        {user?.role === "doctor" && (
          <>
            <Link to="/doctor-dashboard">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/appointments">
              <CalendarDays size={18} /> Schedule
            </Link>
            <Link to="/treatments">
              <HeartPulse size={18} /> Treatments
            </Link>
            <Link to="/medical-records">
              <FileText size={18} /> Medical Records
            </Link>
          </>
        )}

        {user?.role === "manager" && (
          <>
            <Link to="/manager-dashboard">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/appointments">
              <CalendarDays size={18} /> Appointments
            </Link>
            <Link to="/users">
              <Users size={18} /> Users
            </Link>
            <Link to="/invoices">
              <Receipt size={18} /> Invoices
            </Link>
          </>
        )}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}

export default Sidebar;
