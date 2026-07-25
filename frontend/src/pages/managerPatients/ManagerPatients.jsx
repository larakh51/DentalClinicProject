import { useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./managerPatients.module.css";

const PATIENTS_PER_PAGE = 7;

function ManagerPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);

  const firstPatientIndex = (currentPage - 1) * PATIENTS_PER_PAGE;
  const lastPatientIndex = firstPatientIndex + PATIENTS_PER_PAGE;

  const paginatedPatients = filteredPatients.slice(
    firstPatientIndex,
    lastPatientIndex,
  );

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatTime = (time) => {
    if (!time) return "";
    return String(time).slice(0, 5);
  };

  const openPatientView = async (patient) => {
    setSelectedPatient(patient);
    setPatientDetails(patient);
    setMedicalRecord(null);
    setPatientAppointments([]);
    setViewLoading(true);
    setError("");

    try {
      const [userResult, medicalResult, appointmentsResult] =
        await Promise.allSettled([
          api.get(`/users/${patient.id}`),
          api.get(`/medical-records/patient/${patient.id}`),
          api.get(`/appointments?patientId=${patient.id}`),
        ]);

      if (userResult.status === "fulfilled") {
        setPatientDetails(userResult.value.data || patient);
      }

      if (medicalResult.status === "fulfilled") {
        setMedicalRecord(medicalResult.value.data?.medicalRecord || null);
      }

      if (appointmentsResult.status === "fulfilled") {
        setPatientAppointments(
          Array.isArray(appointmentsResult.value.data)
            ? appointmentsResult.value.data
            : [],
        );
      }
    } catch (err) {
      console.log("Failed to load patient details", err);
      setError("Failed to load patient details");
    } finally {
      setViewLoading(false);
    }
  };

  const closePatientView = () => {
    setSelectedPatient(null);
    setPatientDetails(null);
    setMedicalRecord(null);
    setPatientAppointments([]);
    setViewLoading(false);
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
              <h1>Patient Management</h1>
              <p>View and manage all patients</p>
            </div>

            <button
              className={styles.addBtn}
              onClick={() => navigate("/manager-patients/add")}
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
                paginatedPatients.map((patient) => (
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

                    <button
                      type="button"
                      className={styles.viewBtn}
                      onClick={() => openPatientView(patient)}
                    >
                      View
                    </button>
                  </div>
                ))
              )}
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
          </section>
        </section>

        {selectedPatient && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <h2>Patient Details</h2>

                <button type="button" onClick={closePatientView}>
                  ×
                </button>
              </div>

              {viewLoading ? (
                <div className={styles.emptyBox}>
                  Loading patient details...
                </div>
              ) : (
                <>
                  <div className={styles.patientModalHeader}>
                    <div className={styles.modalAvatar}>
                      {getInitials(patientDetails || selectedPatient)}
                    </div>

                    <div>
                      <h3>
                        {patientDetails?.first_name} {patientDetails?.last_name}
                      </h3>
                      <p>{patientDetails?.email}</p>
                    </div>
                  </div>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span>Patient ID</span>
                      <strong>{patientDetails?.id}</strong>
                    </div>

                    <div className={styles.detailItem}>
                      <span>ID Number</span>
                      <strong>
                        {patientDetails?.id_number || "Not provided"}
                      </strong>
                    </div>

                    <div className={styles.detailItem}>
                      <span>Phone</span>
                      <strong>{patientDetails?.phone || "Not provided"}</strong>
                    </div>

                    <div className={styles.detailItem}>
                      <span>Birth Date</span>
                      <strong>{formatDate(patientDetails?.birth_date)}</strong>
                    </div>
                  </div>

                  <div className={styles.recordSection}>
                    <h3>Medical Information</h3>

                    <div className={styles.medicalItem}>
                      <span>Allergies</span>
                      <p>{medicalRecord?.allergies || "None reported"}</p>
                    </div>

                    <div className={styles.medicalItem}>
                      <span>Chronic Diseases</span>
                      <p>
                        {medicalRecord?.chronic_diseases || "None reported"}
                      </p>
                    </div>

                    <div className={styles.medicalItem}>
                      <span>Notes</span>
                      <p>{medicalRecord?.notes || "No notes"}</p>
                    </div>
                  </div>

                  <div className={styles.appointmentsSection}>
                    <h3>Recent Appointments</h3>

                    {patientAppointments.length === 0 ? (
                      <div className={styles.emptyAppointments}>
                        No appointments found
                      </div>
                    ) : (
                      <div className={styles.appointmentsList}>
                        {patientAppointments.slice(0, 5).map((appointment) => (
                          <div
                            className={styles.appointmentItem}
                            key={appointment.id}
                          >
                            <div>
                              <strong>{formatDate(appointment.date)}</strong>

                              <p>
                                {formatTime(appointment.time)} ·{" "}
                                {appointment.doctor_name || "Unknown doctor"}
                              </p>
                            </div>

                            <div className={styles.appointmentRight}>
                              <span>
                                {appointment.treatment_type || "Not provided"}
                              </span>

                              <small
                                className={`${styles.modalStatus} ${
                                  styles[
                                    String(
                                      appointment.status || "",
                                    ).toLowerCase()
                                  ] || ""
                                }`}
                              >
                                {appointment.status}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={closePatientView}>
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManagerPatients;
