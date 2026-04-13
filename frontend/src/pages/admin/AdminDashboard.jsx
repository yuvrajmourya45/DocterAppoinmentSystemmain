import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Stethoscope,
  PlusCircle,
  Menu,
  X,
  Search,
  Activity,
  ChevronDown,
} from "lucide-react";

import AdminAppointments from "./AdminAppointments";
import UsersPage from "./UsersPage";
import AddDoctor from "./AddDoctor";
import DoctorList from "./DoctorList";
import AdminReports from "./AdminReports";
import AdminHistory from "./AdminHistory";
import AdminPatientDetails from "./AdminPatientDetails";
import NotificationCenter from "../../components/NotificationCenter";
import API from "../../utils/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    recentAppointments: [],
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin-login");
      return;
    }

    const loadData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [adminRes, statsRes] = await Promise.all([
          API.get("/api/admin/me", config),
          API.get("/api/admin/stats", config),
        ]);

        setAdmin(adminRes.data);
        setStats({
          doctors: statsRes.data.totalDoctors,
          patients: statsRes.data.totalUsers,
          totalAppointments: statsRes.data.totalAppointments,
          todayAppointments: statsRes.data.todayAppointments,
          recentAppointments: statsRes.data.recentAppointments || [],
        });
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/admin-login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "appointments", label: "Appointments", icon: <Calendar size={20} /> },
    { id: "history", label: "History", icon: <Activity size={20} /> },
    { id: "add-doctor", label: "Add Doctor", icon: <PlusCircle size={20} /> },
    { id: "doctors", label: "Doctors List", icon: <Stethoscope size={20} /> },
    { id: "users", label: "Patients", icon: <Users size={20} /> },
    { id: "reports", label: "Analytics", icon: <BarChart3 size={20} /> },
    // { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden flex">
      <ToastContainer />

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"}
          bg-white border-r border-slate-200 transition-all duration-300 ease-in-out h-full z-50 flex flex-col shadow-lg flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed lg:relative lg:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "hidden"}`}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <Activity className="text-white" size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Prescripto<span className="text-blue-600">Admin</span>
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-200 group font-medium ${activePage === item.id
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
            >
              <div className={`${activePage === item.id ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`}>
                {item.icon}
              </div>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-slate-100">
          <button
            onClick={() => {
              handleLogout();
              // Auto close sidebar on mobile after logout click
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            className={`flex items-center gap-3 lg:gap-4 w-full p-2.5 lg:p-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 ${!sidebarOpen && "justify-center"}`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="font-semibold text-xs lg:text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 min-h-full bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header - Only show on dashboard */}
        {activePage === "dashboard" && (
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 bg-white/80 backdrop-blur-xl p-4 lg:p-6 rounded-2xl border border-white/50 shadow-xl z-30 transition-all gap-4 sm:gap-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <Menu size={20} />
              </button>
              <div className="flex-1 sm:flex-initial">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                  Welcome back, {admin?.name || "Admin"}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">System Overview & Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
              <NotificationCenter doctorId={admin?._id || 'admin'} />
              <div className="h-8 lg:h-10 w-px bg-slate-200 mx-1"></div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 lg:gap-3 pl-2 hover:bg-slate-50 rounded-xl p-2 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs lg:text-sm font-bold text-slate-900 uppercase tracking-tighter">{admin?.name}</p>
                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Super Admin</p>
                  </div>
                  <div className="w-9 h-9 lg:w-11 lg:h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md text-sm lg:text-base">
                    AD
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute top-full right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-48 md:w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 mx-4 sm:mx-0">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 text-center sm:text-left">{admin?.name}</p>
                      <p className="text-xs text-slate-500 text-center sm:text-left">Super Admin</p>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center justify-center sm:justify-start gap-3 w-full px-4 py-3 sm:py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} className="text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Mobile menu button for other pages */}
        {activePage !== "dashboard" && (
          <div className="lg:hidden mb-4 p-4 pt-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium italic">Preparing your workspace...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {activePage === "dashboard" && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    { label: "Total Doctors", value: stats.doctors, icon: <Stethoscope size={20} />, color: "blue", bg: "from-blue-500 to-blue-600", page: "doctors" },
                    { label: "Total Patients", value: stats.patients, icon: <Users size={20} />, color: "emerald", bg: "from-emerald-500 to-emerald-600", page: "users" },
                    { label: "Total Appointments", value: stats.totalAppointments, icon: <Calendar size={20} />, color: "violet", bg: "from-violet-500 to-violet-600", page: "appointments" },
                    { label: "Today's Appointments", value: stats.todayAppointments, icon: <Activity size={20} />, color: "orange", bg: "from-orange-500 to-orange-600", page: "appointments" },
                  ].map((stat, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActivePage(stat.page)}
                      className="bg-white p-4 lg:p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3 lg:mb-4">
                        <div className={`p-2 lg:p-3 rounded-xl bg-gradient-to-r ${stat.bg} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</h3>
                        <p className="text-xs lg:text-sm font-medium text-slate-500">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                  {/* Recent Appointments */}
                  <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-4 lg:p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                      <h3 className="text-lg lg:text-xl font-bold text-slate-800">Recent Appointments</h3>
                      <button onClick={() => setActivePage("appointments")} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All →</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase font-bold tracking-widest">
                            <th className="px-4 lg:px-6 py-3 lg:py-4">Patient</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">Doctor</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4">Date</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {stats.recentAppointments.length > 0 ? (
                            stats.recentAppointments.map((a) => (
                              <tr 
                                key={a._id} 
                                onClick={() => setActivePage("appointments")}
                                className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <p className="font-bold text-slate-700 text-sm">{a.user?.name || "User"}</p>
                                  <p className="text-xs text-slate-400 hidden sm:block">{a.user?.email}</p>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={a.doctor?.image || 'https://via.placeholder.com/40'} 
                                      className="w-6 h-6 lg:w-7 lg:h-7 rounded-full object-cover" 
                                      alt={a.doctor?.name || 'Doctor'}
                                      onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                    />
                                    <span className="text-sm font-semibold text-slate-600">{a.doctor?.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <p className="text-sm text-slate-600">{a.date}</p>
                                  <p className="text-xs text-slate-400">{a.time}</p>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${a.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                    a.status === 'cancelled' || a.cancelled ? 'bg-red-100 text-red-600' :
                                      'bg-blue-100 text-blue-600'
                                    }`}>
                                    {a.cancelled ? 'Cancelled' : a.status || 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="4" className="px-4 lg:px-6 py-8 lg:py-10 text-center text-slate-400 italic">No recent activity</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sidebar Stats / Actions */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h4 className="text-2xl font-bold mb-3">Add New Doctor</h4>
                        <p className="text-blue-100 text-sm mb-6 leading-relaxed">Expand your medical team by registering qualified healthcare professionals to our platform.</p>
                        <button
                          onClick={() => setActivePage("add-doctor")}
                          className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-3 shadow-xl"
                        >
                          <PlusCircle size={20} /> Register Doctor
                        </button>
                      </div>
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-6 text-lg">Quick Actions</h4>
                      <div className="space-y-3">
                        {[
                          { label: "Manage Patients", icon: <Users size={18} />, page: "users", color: "emerald" },
                          { label: "Doctor Directory", icon: <Stethoscope size={18} />, page: "doctors", color: "blue" },
                          { label: "View Analytics", icon: <BarChart3 size={18} />, page: "reports", color: "violet" }
                        ].map((link, i) => (
                          <button
                            key={i}
                            onClick={() => setActivePage(link.page)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 text-slate-600 transition-all border border-slate-100 hover:border-slate-200 hover:shadow-md group"
                          >
                            <div className={`p-2.5 bg-${link.color}-50 rounded-xl text-${link.color}-600 group-hover:scale-110 transition-transform`}>{link.icon}</div>
                            <span className="text-sm font-semibold">{link.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePage === "add-doctor" && <AddDoctor />}
            {activePage === "doctors" && <DoctorList />}
            {activePage === "users" && <UsersPage onViewPatient={(id) => { setSelectedPatientId(id); setActivePage("patient-details"); }} />}
            {activePage === "patient-details" && <AdminPatientDetails patientId={selectedPatientId} onBack={() => setActivePage("users")} />}
            {activePage === "appointments" && <AdminAppointments />}
            {activePage === "history" && <AdminHistory />}
            {activePage === "reports" && <AdminReports />}
            {activePage === "settings" && <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold italic">Settings module coming soon...</div>}
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}

