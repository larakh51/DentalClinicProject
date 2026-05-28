import { useEffect, useState } from "react";
import { Search, CalendarDays, AlertCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorPatients.module.css";

function DoctorPatients() {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      if (!user?.id) return;

      try {
        const res = await api.get(`/users/patients?doctorId=${user.id}`);
        setPatients(res.data || []);
      } catch (err) {
        console.log("Failed to load patients", err);
        setError("Failed to load patients");
        setPatients([]);
      }
    };

    loadPatients();
  }, [user]);

  const getInitials = (patient) => {
    const first = patient.first_name?.[0] || "";
    const last = patient.last_name?.[0] || "";
    return `${first}${last}`;
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const email = patient.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search);
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
          <div className={styles.pageHeader}>
            <h1>Patient List</h1>
            <p>View and manage patient information</p>
          </div>

          <section className={styles.searchCard}>
            <div className={styles.searchBox}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          {error && <div className={styles.errorBox}>{error}</div>}

          {filteredPatients.length === 0 ? (
            <div className={styles.emptyBox}>No patients found</div>
          ) : (
            <section className={styles.patientsGrid}>
              {filteredPatients.map((patient) => (
                <div className={styles.patientCard} key={patient.id}>
                  <div className={styles.patientHeader}>
                    <div className={styles.avatar}>{getInitials(patient)}</div>

                    <div>
                      <h2>
                        {patient.first_name} {patient.last_name}
                      </h2>
                      <p>{patient.email}</p>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoLeft}>
                      <CalendarDays size={17} />
                      <span>Appointments</span>
                    </div>

                    <strong>{patient.appointments_count || 0}</strong>
                  </div>

                  {Number(patient.has_allergies) === 1 && (
                    <div className={styles.allergyRow}>
                      <AlertCircle size={16} />
                      <span>Has allergies</span>
                    </div>
                  )}

                  <button className={styles.detailsBtn}>View Details</button>
                </div>
              ))}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default DoctorPatients;
