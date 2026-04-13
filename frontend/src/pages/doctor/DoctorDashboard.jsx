import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  User,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  X,
  Menu,
  Stethoscope,
  LayoutDashboard,
  LogOut,
  History,
  FolderOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "../../components/NotificationCenter";
import { useNotifications } from "../../hooks/useNotifications";
import PatientHistory from "./PatientHistory";
import PatientMedicalRecords from "../../components/PatientMedicalRecords";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsWithRecords, setPatientsWithRecords] = useState([]);

  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("doctor") || localStorage.getItem("user") || "{}");
  const doctorId = userData?._id || userData?.id;
  const { notifications, unreadCount, addNotification } = useNotifications(doctorId);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `http://localhost:8000${img}`;
    return `http://localhost:8000/uploads/${img}`;
  };

  useEffect(() => {
    console.log("DoctorDashboard mounted, doctorId:", doctorId);
    
    // Add a test notification when dashboard loads
    if (doctorId && addNotification) {
      setTimeout(() => {
        addNotification({
          type: 'new_appointment',
          title: 'Welcome to Dashboard!',
          message: 'Your notification system is working properly. You will receive real-time updates here.',
          data: { test: true }
        });
      }, 2000);
    }
  }, [doctorId, addNotification]);

  const loadData = async () => {
    if (!doctorId) {
      toast.error("Doctor ID not found. Please login again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [docRes, apptRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/doctor/profile/${doctorId}`),
        axios.get(`http://localhost:8000/api/appointments/doctor/${doctorId}`)
      ]);
      setDoctor(docRes.data);
      setAvailable(docRes.data.available ?? true);
      setFormData(docRes.data);
      const newAppointments = apptRes.data || [];
      if (appointments.length > 0 && newAppointments.length > appointments.length) {
        const newAppt = newAppointments[newAppointments.length - 1];
        addNotification({
          type: 'new_appointment',
          title: 'New Appointment Booked',
          message: `New appointment from ${newAppt.user?.name || 'Patient'} on ${newAppt.date} at ${newAppt.time}`,
          data: { appointmentId: newAppt._id }
        });
      }
      setAppointments(newAppointments);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [doctorId]);

  useEffect(() => {
    if (activeTab === 'records') {
      fetchPatientsWithRecords();
    }
  }, [activeTab]);

  const fetchPatientsWithRecords = async () => {
    try {
      const confirmedAppointments = appointments.filter(apt => 
        (apt.status === 'confirmed' || apt.status === 'completed') && apt.user
      );
      
      // Group by patient and get latest appointment
      const patientMap = new Map();
      confirmedAppointments.forEach(apt => {
        const existing = patientMap.get(apt.user._id);
        if (!existing || new Date(apt.date) > new Date(existing.date)) {
          patientMap.set(apt.user._id, {
            ...apt.user,
            appointmentDate: apt.date,
            appointmentTime: apt.time,
            appointmentStatus: apt.status
          });
        }
      });
      
      // Filter patients who have medical records
      const patientsArray = Array.from(patientMap.values());
      const patientsWithActiveRecords = [];
      
      for (const patient of patientsArray) {
        try {
          const res = await axios.get(`http://localhost:8000/api/medical-records/user/${patient._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.length > 0) {
            patientsWithActiveRecords.push(patient);
          }
        } catch (error) {
          console.error('Error checking records for patient:', patient._id);
        }
      }
      
      setPatientsWithRecords(patientsWithActiveRecords);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/doctor/availability/${doctorId}`,
        { available: !available },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailable(res.data.available);
      toast.success(res.data.available ? 'You are now available' : 'You are now unavailable');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update availability');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    navigate('/');
  };

  const handleAppointmentAction = async (appointmentId, status) => {
    try {
      let response;
      if (status === 'completed') {
        response = await axios.patch(
          `http://localhost:8000/api/doctor/complete/${appointmentId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.patch(
          `http://localhost:8000/api/appointments/${appointmentId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      toast.success(`Appointment ${status} successfully!`);
      loadData(); // Refresh appointments
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.message || `Failed to ${status} appointment`);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'address') updateData.append('address', JSON.stringify(formData.address));
        else updateData.append(key, formData[key]);
      });
      if (imageFile) updateData.append('image', imageFile);
      const res = await axios.put(
        `http://localhost:8000/api/doctor/profile/${doctorId}`,
        updateData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      setDoctor(res.data);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
      <p className="mt-4 text-slate-500 font-bold tracking-widest animate-pulse">LOADING DASHBOARD</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      <ToastContainer position="bottom-right" />

      <aside className={`${sidebarOpen ? "w-64 lg:w-72" : "w-0 lg:w-20"} bg-white border-r border-slate-200 transition-all duration-300 fixed h-full z-50 flex flex-col shadow-sm overflow-hidden`}>
        <div className="p-4 lg:p-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 lg:gap-3 ${!sidebarOpen && "hidden lg:flex"}`}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Stethoscope className="text-white" size={20} />
            </div>
            <h1 className="text-lg lg:text-xl font-black tracking-tight">Prescripto<span className="text-blue-600">Doctor</span></h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 lg:px-4 mt-6 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
            { id: "appointments", label: "Appointments", icon: <Calendar size={18} /> },
            { id: "records", label: "Patient Records", icon: <FolderOpen size={18} /> },
            { id: "history", label: "Patient History", icon: <History size={18} /> },
            { id: "profile", label: "Clinic Profile", icon: <User size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`flex items-center gap-3 lg:gap-4 w-full p-2.5 lg:p-3.5 rounded-2xl transition-all group ${activeTab === item.id ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}
            >
              <div className={`${activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`}>{item.icon}</div>
              {sidebarOpen && <span className="font-bold text-xs lg:text-sm tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
          <div className={`flex items-center gap-3 p-2 mb-2 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shrink-0">{doctor?.name?.charAt(0) || 'D'}</div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-800 truncate">{doctor?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">{doctor?.speciality}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-4 w-full p-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest group ${!sidebarOpen && "justify-center"}`}>
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64 lg:ml-72" : "ml-0 lg:ml-20"}`}>
        <header className="bg-white border-b border-slate-200 p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 z-40 gap-4 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-4 flex-1 sm:flex-initial">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800 capitalize">{activeTab === "overview" ? "Dashboard Overview" : activeTab === "appointments" ? "Appointments" : activeTab === "records" ? "Patient Records" : activeTab === "history" ? "Patient History" : "Clinic Profile"}</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{available ? "Available" : "Unavailable"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            <NotificationCenter doctorId={doctorId} />
            <button onClick={toggleAvailability} className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${available ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}>{available ? "Go Offline" : "Go Online"}</button>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div 
                  onClick={() => setActiveTab("appointments")}
                  className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs lg:text-sm font-bold uppercase tracking-wider">Total Appointments</p>
                      <p className="text-2xl lg:text-3xl font-black text-slate-800 mt-2">{appointments.length}</p>
                    </div>
                    <div className="bg-blue-100 p-2 lg:p-3 rounded-xl"><Calendar className="text-blue-600" size={20} /></div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab("appointments")}
                  className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs lg:text-sm font-bold uppercase tracking-wider">Today's Appointments</p>
                      <p className="text-2xl lg:text-3xl font-black text-slate-800 mt-2">{appointments.filter(apt => new Date(apt.date).toDateString() === new Date().toDateString()).length}</p>
                    </div>
                    <div className="bg-green-100 p-2 lg:p-3 rounded-xl"><Clock className="text-green-600" size={20} /></div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab("appointments")}
                  className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs lg:text-sm font-bold uppercase tracking-wider">Completed</p>
                      <p className="text-2xl lg:text-3xl font-black text-slate-800 mt-2">{appointments.filter(apt => apt.status === 'completed').length}</p>
                    </div>
                    <div className="bg-emerald-100 p-2 lg:p-3 rounded-xl"><CheckCircle className="text-emerald-600" size={20} /></div>
                  </div>
                </div>

                <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs lg:text-sm font-bold uppercase tracking-wider">Revenue</p>
                      <p className="text-2xl lg:text-3xl font-black text-slate-800 mt-2">₹{(doctor?.fees || 0) * appointments.filter(apt => apt.status === 'completed').length}</p>
                    </div>
                    <div className="bg-violet-100 p-2 lg:p-3 rounded-xl"><DollarSign className="text-violet-600" size={20} /></div>
                  </div>
                </div>
              </div>

              {/* Analytics Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Trends Bar Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-xl font-black text-slate-800 mb-6">Appointment Status Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Completed</span>
                        <span className="text-sm font-bold text-green-600">{appointments.filter(apt => apt.status === 'completed').length}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${appointments.length ? (appointments.filter(apt => apt.status === 'completed').length / appointments.length * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Confirmed</span>
                        <span className="text-sm font-bold text-blue-600">{appointments.filter(apt => apt.status === 'confirmed').length}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${appointments.length ? (appointments.filter(apt => apt.status === 'confirmed').length / appointments.length * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Pending</span>
                        <span className="text-sm font-bold text-yellow-600">{appointments.filter(apt => apt.status === 'pending').length}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${appointments.length ? (appointments.filter(apt => apt.status === 'pending').length / appointments.length * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Cancelled</span>
                        <span className="text-sm font-bold text-red-600">{appointments.filter(apt => apt.cancelled).length}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${appointments.length ? (appointments.filter(apt => apt.cancelled).length / appointments.length * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue & Patient Stats */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-xl font-black text-slate-800 mb-6">Revenue & Patient Analytics</h3>
                  <div className="space-y-6">
                    {/* Revenue Circle */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-600 mb-1">Total Revenue</p>
                        <p className="text-3xl font-black text-green-600">₹{(doctor?.fees || 0) * appointments.filter(apt => apt.status === 'completed').length}</p>
                        <p className="text-xs text-slate-500 mt-1">From {appointments.filter(apt => apt.status === 'completed').length} completed appointments</p>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <span className="text-2xl">💰</span>
                      </div>
                    </div>

                    {/* Unique Patients */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-600 mb-1">Unique Patients</p>
                        <p className="text-3xl font-black text-blue-600">{new Set(appointments.map(apt => apt.user?._id).filter(Boolean)).size}</p>
                        <p className="text-xs text-slate-500 mt-1">Total patients served</p>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <span className="text-2xl">👥</span>
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <p className="text-sm font-bold text-slate-600 mb-3">Completion Rate</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${appointments.length ? (appointments.filter(apt => apt.status === 'completed').length / appointments.length * 100) : 0}%` }}
                            >
                              <span className="text-xs font-bold text-white">
                                {appointments.length ? Math.round(appointments.filter(apt => apt.status === 'completed').length / appointments.length * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl">📈</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-black text-slate-800">Recent Appointments</h3></div>
                <div className="p-6">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><User className="text-blue-600" size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-800">{appointment.user?.name || 'Patient'}</p>
                          <p className="text-sm text-slate-500">{appointment.date} at {appointment.time}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{appointment.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-4 sm:p-6 border-b border-slate-100"><h3 className="text-lg sm:text-xl font-black text-slate-800">All Appointments</h3></div>
              
              {/* Mobile View - Cards */}
              <div className="block lg:hidden">
                {appointments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No appointments yet</div>
                ) : (
                  <div className="p-4 space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment._id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="text-blue-600" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{appointment.user?.name || 'Patient'}</p>
                            <p className="text-sm text-slate-500 truncate">{appointment.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-bold text-slate-800">{appointment.date}</p>
                            <p className="text-slate-500">{appointment.time}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {appointment.status}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {appointment.hasMedicalRecords && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-2">
                              <span>📋</span>
                              <span>{appointment.medicalRecordsCount} Record{appointment.medicalRecordsCount > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {!appointment.hasMedicalRecords && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold mb-2">
                              <span>📄</span>
                              <span>No Records</span>
                            </div>
                          )}
                          {appointment.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleAppointmentAction(appointment._id, 'confirmed')}
                                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(appointment._id, 'rejected')}
                                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedPatient(appointment.user?._id);
                                  setActiveTab('records');
                                }}
                                className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition-colors"
                              >
                                View Records
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(appointment._id, 'completed')}
                                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                              >
                                Complete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Patient</th>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Date & Time</th>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><User className="text-blue-600" size={16} /></div>
                            <div>
                              <p className="font-bold text-slate-800">{appointment.user?.name || 'Patient'}</p>
                              <p className="text-sm text-slate-500">{appointment.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><p className="font-bold text-slate-800">{appointment.date}</p><p className="text-sm text-slate-500">{appointment.time}</p></td>
                        <td className="p-4"><div className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{appointment.status}</div></td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {appointment.hasMedicalRecords && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                <span>📋</span>
                                <span>{appointment.medicalRecordsCount} Record{appointment.medicalRecordsCount > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {!appointment.hasMedicalRecords && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
                                <span>📄</span>
                                <span>No Records</span>
                              </div>
                            )}
                            {appointment.status === 'confirmed' && (
                              <button 
                                onClick={() => {
                                  setSelectedPatient(appointment.user?._id);
                                  setActiveTab('records');
                                }}
                                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition-colors"
                              >
                                View Records
                              </button>
                            )}
                            {appointment.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleAppointmentAction(appointment._id, 'confirmed')}
                                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleAppointmentAction(appointment._id, 'rejected')}
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {appointment.status === 'confirmed' && (
                              <button 
                                onClick={() => handleAppointmentAction(appointment._id, 'completed')}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "records" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <h3 className="text-lg sm:text-xl font-black text-slate-800">Patient Medical Records</h3>
                <p className="text-sm text-slate-500 mt-1">View medical records of patients with confirmed appointments</p>
              </div>
              
              {patientsWithRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <FolderOpen className="mx-auto text-slate-300 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-slate-600 mb-2">No Patients Yet</h3>
                  <p className="text-slate-500">Patients with confirmed appointments will appear here</p>
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patientsWithRecords.map((patient) => (
                      <div 
                        key={patient._id}
                        onClick={() => setSelectedPatient(patient._id)}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {patient.name?.charAt(0) || 'P'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{patient.name}</h4>
                            <p className="text-xs text-slate-500 truncate">{patient.email}</p>
                          </div>
                        </div>
                        
                        {patient.appointmentDate && (
                          <div className="bg-white/60 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar size={14} className="text-blue-600" />
                              <span className="font-medium">{patient.appointmentDate}</span>
                              <Clock size={14} className="text-blue-600 ml-1" />
                              <span className="font-medium">{patient.appointmentTime}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${patient.appointmentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {patient.appointmentStatus === 'completed' ? 'Completed' : 'Confirmed'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                          <FolderOpen size={16} />
                          View Records
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <PatientHistory doctorId={doctorId} />
          )}

          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">Clinic Profile</h3>
                <button onClick={() => setEditMode(!editMode)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">{editMode ? 'Cancel' : 'Edit Profile'}</button>
              </div>
              {editMode ? (
                <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Name</label>
                      <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
                      <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Speciality</label>
                      <input type="text" value={formData.speciality || ''} onChange={(e) => setFormData({...formData, speciality: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Fees</label>
                      <input type="number" value={formData.fees || ''} onChange={(e) => setFormData({...formData, fees: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">About</label>
                    <textarea value={formData.about || ''} onChange={(e) => setFormData({...formData, about: e.target.value})} rows={4} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Profile Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Update Profile</button>
                </form>
              ) : (
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-48 h-48 bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {doctor?.image ? <img src={getImageUrl(doctor.image)} alt={doctor.name} className="w-full h-full object-cover rounded-2xl" /> : <User className="text-blue-600" size={56} />}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-3xl font-black text-slate-800">{doctor?.name}</h4>
                        <p className="text-blue-600 font-bold">{doctor?.speciality}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Email</p>
                          <p className="text-slate-800 font-bold">{doctor?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Fees</p>
                          <p className="text-slate-800 font-bold">₹{doctor?.fees}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Experience</p>
                          <p className="text-slate-800 font-bold">{doctor?.experience} years</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Degree</p>
                          <p className="text-slate-800 font-bold">{doctor?.degree}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">About</p>
                        <p className="text-slate-600 leading-relaxed">{doctor?.about}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedPatient && (
        <PatientMedicalRecords 
          patientId={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
