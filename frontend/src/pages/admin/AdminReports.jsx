import React, { useEffect, useState } from "react";
import { BarChart3, Users, Stethoscope, Calendar, TrendingUp } from "lucide-react";
import API from "../../utils/api";

export default function AdminReports() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [doc, pat, app] = await Promise.all([
        API.get(`/api/admin/doctors`, config),
        API.get(`/api/admin/users`, config),
        API.get(`/api/admin/appointments`, config)
      ]);

      setStats({
        doctors: doc.data.length,
        patients: pat.data.length,
        appointments: app.data.appointments.length
      });
    } catch (err) {
      console.log("Error loading reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const cards = [
    { title: "Clinical Staff", value: stats.doctors, icon: <Stethoscope size={24} />, color: "blue", trend: "+2 this month" },
    { title: "Total Patients", value: stats.patients, icon: <Users size={24} />, color: "emerald", trend: "+15% growth" },
    { title: "Total Appointments", value: stats.appointments, icon: <Calendar size={24} />, color: "purple", trend: "Steady" },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Advanced Analytics</h1>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Deep dive into clinical performance metrics</p>
        </div>
        <div className="bg-blue-600 text-white p-2 sm:p-3 rounded-2xl shadow-lg">
          <TrendingUp size={20} className="sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className={`p-2 sm:p-4 rounded-2xl bg-${card.color}-50 text-${card.color}-600 w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
              <div className="w-5 h-5 sm:w-6 sm:h-6">{card.icon}</div>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">{card.title}</h2>
            <div className="flex items-baseline gap-2 sm:gap-3 mt-2">
              <p className="text-2xl sm:text-4xl font-black text-slate-800">{card.value}</p>
              <span className="text-[8px] sm:text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 sm:mt-10 bg-white p-6 sm:p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center">
        <div className="bg-slate-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-slate-300">
          <BarChart3 size={32} className="sm:w-10 sm:h-10" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">Detailed Visualizations Coming Soon</h3>
        <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base px-4">We are currently processing your historical data to generate interactive charts and demographic insights.</p>
      </div>
    </div>
  );
}

