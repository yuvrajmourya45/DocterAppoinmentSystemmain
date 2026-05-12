import React, { useEffect } from "react";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";

// User Pages
import Home from "./pages/user/Home";
import Docters from "./pages/user/Docters";
import MyProfile from "./pages/user/MyProfile";
import MyAppointment from "./pages/user/MyAppointment";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import About from "./pages/user/About";
import Contact from "./pages/user/Contact";
import Appointment from "./pages/user/Appointment";
import Debug from "./pages/user/Debug";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatientDetails from "./pages/admin/AdminPatientDetails";

// Doctor Pages
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// ============ PROTECTED ROUTE WRAPPERS ============

// Admin Route - Only admin can access
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin-login" replace />;
  return children;
};

// Doctor Route - Only doctor can access
const DoctorProtectedRoute = ({ children }) => {
  const doctorStr = localStorage.getItem("doctor");
  const doctor = (doctorStr && doctorStr !== "undefined") ? JSON.parse(doctorStr) : {};
  const token = localStorage.getItem("token");
  if (!token || !doctor._id) return <Navigate to="/doctor-login" replace />;
  return children;
};

// ============ MAIN APP COMPONENT ============

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ping backend on app load to wake up Render
  useEffect(() => {
    fetch('https://docterappoinmentsystemmain.onrender.com/api/debug')
      .catch(() => {});
  }, []);

  // Get user data from localStorage
  const userStr = localStorage.getItem("user");
  const user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : {};
  const token = localStorage.getItem("token");

  // Check if current page is admin or doctor page
  const isAdminPage = location.pathname.startsWith("/admin-");
  const isDoctorPage = location.pathname.startsWith("/doctor-");
  const isDedicatedPage = isAdminPage || isDoctorPage;

  // Auto-redirect based on user role
  useEffect(() => {
    if (token) {
      const userStr = localStorage.getItem("user") || "{}";
      const user = (userStr !== "undefined") ? JSON.parse(userStr) : {};
      const doctorStr = localStorage.getItem("doctor") || "{}";
      const doctor = (doctorStr !== "undefined") ? JSON.parse(doctorStr) : {};
      
      // Redirect admin to admin dashboard
      if (user.role === "admin" && !isAdminPage && location.pathname !== "/admin-login") {
        navigate("/admin-dashboard");
      } 
      // Redirect doctor to doctor dashboard
      else if (doctor._id && !isDoctorPage && location.pathname !== "/doctor-login") {
        navigate("/doctor-dashboard");
      }
    }
  }, [location.pathname, token, navigate]);

  return (
    <div className={isDedicatedPage ? "" : "mx-4 sm:mx-[10%]"}>
      {/* Show Navbar only on user pages */}
      {!isDedicatedPage && <Navbar />}

      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Docters />} />
        <Route path="/doctors/:speciality" element={<Docters />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/debug" element={<Debug />} />
        
        {/* ========== AUTH ROUTES ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />

        {/* ========== USER PROTECTED ROUTES ========== */}
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointment />
            </ProtectedRoute>
          }
        />
        <Route path="/appointment/:docId" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />

        {/* ========== ADMIN PROTECTED ROUTES ========== */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/patients/:patientId"
          element={
            <AdminProtectedRoute>
              <AdminPatientDetails />
            </AdminProtectedRoute>
          }
        />

        {/* ========== DOCTOR PROTECTED ROUTES ========== */}
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorProtectedRoute>
              <DoctorDashboard />
            </DoctorProtectedRoute>
          }
        />

        {/* ========== 404 REDIRECT ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Show Footer only on user pages */}
      {!isDedicatedPage && <Footer />}
    </div>
  );
};

export default App;
