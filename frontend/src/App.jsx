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
      </Routes>
    </>
  );
}

export default App;
