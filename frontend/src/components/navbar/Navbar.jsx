import { useAuth } from "../../context/AuthContext";

function Navbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h1>{title}</h1>
        <p>Welcome back, {user?.firstName || "User"}</p>
      </div>

      <div className="navbar-user">
        <div className="avatar">{user?.firstName?.charAt(0) || "U"}</div>
        <div>
          <strong>
            {user?.firstName} {user?.lastName}
          </strong>
          <span>{user?.email}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
