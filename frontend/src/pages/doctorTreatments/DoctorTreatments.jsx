import { useEffect, useState } from "react";
import { CalendarDays, DollarSign } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorTreatments.module.css";

function DoctorTreatments() {
  const { user } = useAuth();

  const [treatments, setTreatments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTreatments = async () => {
      if (!user?.id) return;

      try {
        const res = await api.get(`/treatments?doctorId=${user.id}`);
        setTreatments(res.data || []);
      } catch (err) {
        console.log("Failed to load treatments", err.response?.data || err);

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load treatments",
        );

        setTreatments([]);
      }
    };

    loadTreatments();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
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
            <h1>Treatment History</h1>
            <p>All documented treatments</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent Treatments</h2>
              <p>Treatments you've performed</p>
            </div>

            {treatments.length === 0 ? (
              <div className={styles.emptyBox}>No treatments found</div>
            ) : (
              <div className={styles.treatmentList}>
                {treatments.map((treatment) => (
                  <div className={styles.treatmentItem} key={treatment.id}>
                    <div className={styles.treatmentContent}>
                      <h3>{treatment.description}</h3>

                      <div className={styles.dateRow}>
                        <CalendarDays size={17} />
                        <span>{formatDate(treatment.treatment_date)}</span>
                      </div>

                      <p>
                        <strong>Materials:</strong>{" "}
                        {treatment.materials || "Not specified"}
                      </p>
                    </div>

                    <div className={styles.costBadge}>
                      <DollarSign size={14} />
                      <span>₪{treatment.cost || 0}</span>
                    </div>
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

export default DoctorTreatments;
