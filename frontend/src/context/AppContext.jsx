import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { doctors as localDoctors } from "../assets/assets_frontend/assets";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [userMedicalRecords, setUserMedicalRecords] = useState([]);
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors`);
      console.log('Doctors data from backend:', data);
      if (data && data.length > 0) {
        setDoctors(data);
        console.log('✅ Using backend doctors:', data.length);
      } else {
        console.log('❌ No doctors found in backend');
        setDoctors([]);
      }
    } catch (error) {
      console.log('❌ Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const getUserMedicalRecords = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const { data } = await axios.get(`${backendUrl}/api/medical-records/my-records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserMedicalRecords(data || []);
      console.log('✅ Medical records loaded:', data?.length || 0);
    } catch (error) {
      console.log('❌ Error fetching medical records:', error);
      setUserMedicalRecords([]);
    }
  };

  const bookAppointmentWithRecords = async (appointmentData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please login first');

    try {
      // Book appointment with medical records info
      const appointmentPayload = {
        ...appointmentData,
        hasMedicalRecords: userMedicalRecords.length > 0,
        medicalRecordsCount: userMedicalRecords.length
      };

      const response = await axios.post(`${backendUrl}/api/appointments`, appointmentPayload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Appointment booked with medical records info:', {
        appointmentId: response.data._id,
        medicalRecords: userMedicalRecords.length
      });

      return response.data;
    } catch (error) {
      console.log('❌ Error booking appointment:', error);
      throw error;
    }
  };

  useEffect(() => {
    getDoctorsData();
    getUserMedicalRecords();
  }, []);

  const value = {
    doctors,
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
