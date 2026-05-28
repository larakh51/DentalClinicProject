import { useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerPatients.module.css";

function ManagerPatients() {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await api.get("/users/patients");
        setPatients(res.data || []);
      } catch (err) {
        console.log("Failed to load patients", err);
        setError("Failed to load patients");
        setPatients([]);
      }
    };

    loadPatients();
  }, []);

  const getInitials = (patient) => {
    const first = patient.first_name?.[0] || "";
    const last = patient.last_name?.[0] || "";
    return `${first}${last}`;
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const email = patient.email?.toLowerCase() || "";
    const phone = patient.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search)
    );
  });

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
              <h1>Patient Management</h1>
              <p>View and manage all patients</p>
            </div>

            <button
              className={styles.addBtn}
              onClick={() => alert("Add patient page will be added later")}
            >
              <UserPlus size={17} />
              Add Patient
            </button>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>All Patients</h2>
              <p>Total: {filteredPatients.length} patients</p>
            </div>

            <div className={styles.searchBox}>
              <Search size={19} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Patient</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Actions</span>
              </div>

              {filteredPatients.length === 0 ? (
                <div className={styles.emptyBox}>No patients found</div>
              ) : (
                filteredPatients.map((patient) => (
                  <div className={styles.tableRow} key={patient.id}>
                    <div className={styles.patientCell}>
                      <div className={styles.avatar}>
                        {getInitials(patient)}
                      </div>

                      <strong>
                        {patient.first_name} {patient.last_name}
                      </strong>
                    </div>

                    <span>{patient.email}</span>

                    <span>{patient.phone || "Not provided"}</span>

                    <button className={styles.viewBtn}>View</button>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ManagerPatients;
