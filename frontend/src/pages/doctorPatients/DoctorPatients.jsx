import { useEffect, useState } from "react";
import { Search, CalendarDays, AlertCircle, Clock3 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./doctorPatients.module.css";

const PATIENTS_PER_PAGE = 6;

function DoctorPatients() {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getInitials = (patient) => {
    const first = patient.first_name?.[0] || "";
    const last = patient.last_name?.[0] || "";

    return `${first}${last}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatTime = (time) => {
    if (!time) return "Not provided";

    return String(time).slice(0, 5);
  };

  const openPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setPatientAppointments([]);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const res = await api.get("/appointments", {
        params: {
          patientId: patient.id,
          doctorId: user.id,
        },
      });

      setPatientAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(
        "Failed to load patient appointments",
        err.response?.data || err,
      );

      setDetailsError(
        err.response?.data?.message ||
          "Failed to load patient appointment details",
      );

      setPatientAppointments([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closePatientDetails = () => {
    setSelectedPatient(null);
    setPatientAppointments([]);
    setDetailsError("");
    setDetailsLoading(false);
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();

    const email = patient.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search);
  });

  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);

  const firstPatientIndex = (currentPage - 1) * PATIENTS_PER_PAGE;

  const lastPatientIndex = firstPatientIndex + PATIENTS_PER_PAGE;

  const paginatedPatients = filteredPatients.slice(
    firstPatientIndex,
    lastPatientIndex,
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
            <>
              <section className={styles.patientsGrid}>
                {paginatedPatients.map((patient) => (
                  <div className={styles.patientCard} key={patient.id}>
                    <div className={styles.patientHeader}>
                      <div className={styles.avatar}>
                        {getInitials(patient)}
                      </div>

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

                    <button
                      type="button"
                      className={styles.detailsBtn}
                      onClick={() => openPatientDetails(patient)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </section>

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

        {selectedPatient && (
          <div className={styles.modalOverlay}>
            <div className={styles.detailsModal}>
              <div className={styles.modalHeader}>
                <div className={styles.modalPatient}>
                  <div className={styles.avatar}>
                    {getInitials(selectedPatient)}
                  </div>

                  <div>
                    <h2>
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h2>

                    <p>Patient Details</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={closePatientDetails}
                >
                  ×
                </button>
              </div>

              <div className={styles.detailsList}>
                <div>
                  <span>Email</span>

                  <strong>{selectedPatient.email || "Not provided"}</strong>
                </div>

                <div>
                  <span>Phone</span>

                  <strong>{selectedPatient.phone || "Not provided"}</strong>
                </div>

                <div>
                  <span>Total Appointments</span>

                  <strong>{patientAppointments.length}</strong>
                </div>

                <div>
                  <span>Allergies</span>

                  <strong>
                    {Number(selectedPatient.has_allergies) === 1 ? "Yes" : "No"}
                  </strong>
                </div>
              </div>

              <div className={styles.appointmentsSection}>
                <div className={styles.appointmentsHeader}>
                  <h3>Appointment & Treatment History</h3>

                  <span>{patientAppointments.length} records</span>
                </div>

                {detailsLoading ? (
                  <div className={styles.modalEmpty}>
                    Loading appointment details...
                  </div>
                ) : detailsError ? (
                  <div className={styles.modalError}>{detailsError}</div>
                ) : patientAppointments.length === 0 ? (
                  <div className={styles.modalEmpty}>No appointments found</div>
                ) : (
                  <div className={styles.appointmentsList}>
                    {patientAppointments.map((appointment, index) => (
                      <div
                        className={styles.appointmentItem}
                        key={appointment.id}
                      >
                        <div className={styles.appointmentItemHeader}>
                          <div>
                            <span className={styles.appointmentNumber}>
                              Appointment {index + 1}
                            </span>

                            <h4>
                              {appointment.treatment_type ||
                                "Treatment not provided"}
                            </h4>
                          </div>

                          <span
                            className={`${styles.appointmentStatus} ${
                              styles[appointment.status] || ""
                            }`}
                          >
                            {appointment.status || "scheduled"}
                          </span>
                        </div>

                        <div className={styles.appointmentDetailsGrid}>
                          <div>
                            <CalendarDays size={16} />

                            <span>
                              <small>Date</small>
                              <strong>{formatDate(appointment.date)}</strong>
                            </span>
                          </div>

                          <div>
                            <Clock3 size={16} />

                            <span>
                              <small>Time</small>

                              <strong>
                                {formatTime(appointment.time)}

                                {appointment.end_time
                                  ? ` - ${formatTime(appointment.end_time)}`
                                  : ""}
                              </strong>
                            </span>
                          </div>

                          <div>
                            <span>
                              <small>Duration</small>

                              <strong>
                                {appointment.duration_minutes
                                  ? `${appointment.duration_minutes} minutes`
                                  : "Not provided"}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className={styles.treatmentDetails}>
                          <div>
                            <span>Treatment Type</span>

                            <strong>
                              {appointment.treatment_type || "Not provided"}
                            </strong>
                          </div>

                          <div>
                            <span>Notes</span>

                            <strong>{appointment.notes || "No notes"}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closePatientDetails}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorPatients;
