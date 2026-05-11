import React, { createContext, useState, useEffect } from "react";
import API from "../utils/api";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [userMedicalRecords, setUserMedicalRecords] = useState([]);
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

  const getUserMedicalRecords = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await API.get("/api/medical-records/my-records", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserMedicalRecords(data || []);
    } catch (error) {
      setUserMedicalRecords([]);
    }
  };

  const bookAppointmentWithRecords = async (appointmentData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please login first');
    const appointmentPayload = {
      ...appointmentData,
      hasMedicalRecords: userMedicalRecords.length > 0,
      medicalRecordsCount: userMedicalRecords.length
    };
    const response = await API.post("/api/appointments", appointmentPayload, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  useEffect(() => {
    getDoctorsData();
    getUserMedicalRecords();
  }, []);

  const value = {
    doctors,
    doctorsLoading,
    currencySymbol,
    getDoctorsData,
    backendUrl,
    userMedicalRecords,
    getUserMedicalRecords,
    bookAppointmentWithRecords
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
