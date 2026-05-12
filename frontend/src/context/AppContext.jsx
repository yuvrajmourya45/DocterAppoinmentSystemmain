import React, { createContext, useState, useEffect } from "react";
import API from "../utils/api";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://docterappoinmentsystemmain.onrender.com";

  const getDoctorsData = async () => {
    try {
      setDoctorsLoading(true);
      const { data } = await API.get("/api/doctors");
      setDoctors(data || []);
    } catch (error) {
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
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
    getDoctorsData();
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
