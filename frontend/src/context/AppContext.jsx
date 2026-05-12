import React, { createContext, useState, useEffect } from "react";
import API from "../utils/api";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://docterappoinmentsystemmain.onrender.com";

  const getDoctorsData = async (showLoading = true) => {
    try {
      if (showLoading) setDoctorsLoading(true);
      const { data } = await API.get("/api/doctors");
      // Only update if we got actual data (avoid clearing on cold start empty response)
      if (data && data.length > 0) {
        setDoctors(data);
      }
    } catch (error) {
      // keep existing data on error
    } finally {
      if (showLoading) setDoctorsLoading(false);
    }
  };

  const bookAppointment = async (appointmentData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please login first');
    const response = await API.post("/api/appointments", appointmentData, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  useEffect(() => {
    getDoctorsData(true);
    // Refetch after 3s and 7s to handle Render cold start
    const t1 = setTimeout(() => getDoctorsData(false), 3000);
    const t2 = setTimeout(() => getDoctorsData(false), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const value = {
    doctors,
    doctorsLoading,
    currencySymbol,
    getDoctorsData,
    backendUrl,
    bookAppointment
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
