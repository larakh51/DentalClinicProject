import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import PatientDashboard from "./pages/patientDashboard/PatientDashboard";
import BookAppointment from "./pages/bookAppointment/BookAppointment";
import MyAppointments from "./pages/myAppointments/MyAppointments";
import MedicalRecords from "./pages/medicalRecords/MedicalRecords";
import Payments from "./pages/payments/Payments";
import Profile from "./pages/profile/Profile";
import ManagerDashboard from "./pages/managerDashboard/ManagerDashboard";
import DoctorDashboard from "./pages/doctorDashboard/DoctorDashboard";
import ManagerAppointments from "./pages/managerAppointments/ManagerAppointments";
import ManagerPatients from "./pages/managerPatients/ManagerPatients";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <MedicalRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager-dashboard"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-appointments"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-patients"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerPatients />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
