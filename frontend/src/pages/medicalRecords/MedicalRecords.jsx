import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./medicalRecords.module.css";

function MedicalRecords() {
  const { user } = useAuth();

  const [record, setRecord] = useState({
    bloodType: "A+",
    allergies: ["Penicillin"],
    conditions: ["Gingivitis (treated)"],
    medications: [],
    doctorNotes:
      "Patient has anxiety about dental procedures. Recommend gentle approach.",
  });

  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    const loadMedicalData = async () => {
      if (!user?.id) return;

      try {
        const recordRes = await api.get(
          `/medical-records?patientId=${user.id}`,
        );

        if (recordRes.data) {
          setRecord({
            bloodType: recordRes.data.blood_type || "A+",
            allergies: recordRes.data.allergies
              ? recordRes.data.allergies.split(",")
              : ["Penicillin"],
            conditions: recordRes.data.conditions
              ? recordRes.data.conditions.split(",")
              : ["Gingivitis (treated)"],
            medications: recordRes.data.medications
              ? recordRes.data.medications.split(",")
              : [],
            doctorNotes:
              recordRes.data.notes ||
              "Patient has anxiety about dental procedures. Recommend gentle approach.",
          });
        }
      } catch (error) {
        console.log("Medical record fallback data used", error);
      }

      try {
        const treatmentsRes = await api.get(`/treatments?patientId=${user.id}`);
        setTreatments(treatmentsRes.data || []);
      } catch (error) {
        console.log("Treatments fallback data used", error);

        setTreatments([
          {
            id: "t1",
            description: "Teeth cleaning and fluoride treatment",
            date: "2026-02-15",
            materials: "Fluoride gel, cleaning tools",
            cost: 350,
          },
          {
            id: "t2",
            description: "Composite filling - tooth #14",
            date: "2026-01-20",
            materials: "Composite resin, anesthetic",
            cost: 450,
          },
        ]);
      }
    };

    loadMedicalData();
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
            <h1>Medical Record</h1>
            <p>Your dental health information (read-only)</p>
          </div>

          <section className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <div className={styles.iconPink}>
                  <Activity size={22} />
                </div>

                <div>
                  <h3>Blood Type</h3>
                  <p>Blood group information</p>
                </div>
              </div>

              <strong>{record.bloodType}</strong>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <div className={styles.iconPurple}>
                  <FileText size={22} />
                </div>

                <div>
                  <h3>Total Treatments</h3>
                  <p>Dental procedures completed</p>
                </div>
              </div>

              <strong>{treatments.length}</strong>
            </div>
          </section>

          <section className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <AlertCircle size={20} className={styles.redIcon} />
              <div>
                <h2>Allergies</h2>
                <p>Known allergic reactions</p>
              </div>
            </div>

            <div className={styles.tags}>
              {record.allergies.length > 0 ? (
                record.allergies.map((item) => (
                  <span className={styles.redTag} key={item}>
                    {item.trim()}
                  </span>
                ))
              ) : (
                <p className={styles.emptyText}>No allergies reported</p>
              )}
            </div>
          </section>

          <section className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <Activity size={20} className={styles.orangeIcon} />
              <div>
                <h2>Medical Conditions</h2>
                <p>Current and past conditions</p>
              </div>
            </div>

            <div className={styles.tags}>
              {record.conditions.length > 0 ? (
                record.conditions.map((item) => (
                  <span className={styles.orangeTag} key={item}>
                    {item.trim()}
                  </span>
                ))
              ) : (
                <p className={styles.emptyText}>No conditions reported</p>
              )}
            </div>
          </section>

          <section className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <Pill size={20} className={styles.blueIcon} />
              <div>
                <h2>Current Medications</h2>
                <p>Active prescriptions and supplements</p>
              </div>
            </div>

            {record.medications.length > 0 ? (
              <div className={styles.tags}>
                {record.medications.map((item) => (
                  <span className={styles.blueTag} key={item}>
                    {item.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>No current medications</p>
            )}
          </section>

          <section className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <Stethoscope size={20} className={styles.darkIcon} />
              <div>
                <h2>Doctor's Notes</h2>
                <p>Additional medical information</p>
              </div>
            </div>

            <p className={styles.noteText}>{record.doctorNotes}</p>
          </section>

          <section className={styles.infoCard}>
            <div className={styles.treatmentHeader}>
              <div>
                <h2>Treatment History</h2>
                <p>Past dental procedures</p>
              </div>
            </div>

            <div className={styles.treatmentList}>
              {treatments.length === 0 ? (
                <p className={styles.emptyText}>No treatments found</p>
              ) : (
                treatments.map((treatment) => (
                  <div className={styles.treatmentItem} key={treatment.id}>
                    <div>
                      <h3>{treatment.description}</h3>

                      <div className={styles.dateLine}>
                        <CalendarDays size={16} />
                        <span>{formatDate(treatment.date)}</span>
                      </div>

                      {treatment.materials && (
                        <p>Materials: {treatment.materials}</p>
                      )}
                    </div>

                    <span className={styles.price}>₪{treatment.cost}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.noticeBox}>
            <strong>Note:</strong> This is a read-only view of your medical
            record. If you notice any errors or need to update information,
            please contact the clinic or speak with your dentist during your
            next visit.
          </section>
        </section>
      </main>
    </div>
  );
}

export default MedicalRecords;
