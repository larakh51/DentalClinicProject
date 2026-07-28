import { useEffect, useState } from "react";
import { CalendarDays, DollarSign, Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorTreatments.module.css";

const TREATMENTS_PER_PAGE = 6;

function DoctorTreatments() {
  const { user } = useAuth();

  const [treatments, setTreatments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const filteredTreatments = treatments.filter((treatment) => {
    const search = searchTerm.trim().toLowerCase();

    const description = String(treatment.description || "").toLowerCase();
    const materials = String(treatment.materials || "").toLowerCase();
    const date = formatDate(treatment.date).toLowerCase();
    const cost = String(treatment.cost || "").toLowerCase();

    return (
      description.includes(search) ||
      materials.includes(search) ||
      date.includes(search) ||
      cost.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredTreatments.length / TREATMENTS_PER_PAGE);

  const firstTreatmentIndex = (currentPage - 1) * TREATMENTS_PER_PAGE;
  const lastTreatmentIndex = firstTreatmentIndex + TREATMENTS_PER_PAGE;

  const paginatedTreatments = filteredTreatments.slice(
    firstTreatmentIndex,
    lastTreatmentIndex,
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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

            <div className={styles.searchBox}>
              <Search size={19} />

              <input
                type="text"
                placeholder="Search treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredTreatments.length === 0 ? (
              <div className={styles.emptyBox}>No treatments found</div>
            ) : (
              <>
                <div className={styles.treatmentList}>
                  {paginatedTreatments.map((treatment) => (
                    <div className={styles.treatmentItem} key={treatment.id}>
                      <div className={styles.treatmentContent}>
                        <h3>{treatment.description}</h3>

                        <div className={styles.dateRow}>
                          <CalendarDays size={17} />
                          <span>{formatDate(treatment.date)}</span>{" "}
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

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      type="button"
                      className={styles.paginationArrow}
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;

                      return (
                        <button
                          type="button"
                          key={pageNumber}
                          className={
                            currentPage === pageNumber
                              ? `${styles.pageButton} ${styles.activePage}`
                              : styles.pageButton
                          }
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className={styles.paginationArrow}
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default DoctorTreatments;
