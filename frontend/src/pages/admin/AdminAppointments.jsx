import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Calendar, CheckCircle, XCircle, Clock, MoreVertical, Check, X } from "lucide-react";
import API from "../../utils/api";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/admin/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error("Error loading appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await API.post("/api/admin/appointment-status",
        { appointmentId: id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Appointment marked as ${status}`);
      loadAppointments();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.post("/api/admin/cancel-appointment",
        { appointmentId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment cancelled");
      loadAppointments();
    } catch (err) {
      toast.error("Failed to cancel appointment");
    }
  };

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Calendar size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Appointment Ledger</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm uppercase tracking-wider">Patient</th>
                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm uppercase tracking-wider hidden sm:table-cell">Doctor</th>
                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm uppercase tracking-wider">Date & Time</th>
                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm uppercase tracking-wider">Status</th>
                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm uppercase tracking-wider text-center hidden md:table-cell">View Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {appointments.length > 0 ? (
                appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="p-2 sm:p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xs sm:text-sm">{a.user?.name || "Deleted User"}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">{a.user?.email}</span>
                        <div className="sm:hidden mt-1">
                          {a.doctor && typeof a.doctor === 'object' ? (
                            <span className="text-[10px] text-blue-600 font-semibold">{a.doctor?.name || 'Unknown Doctor'}</span>
                          ) : (
                            <span className="text-[10px] text-gray-600">Doctor ID: {a.doctor}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-gray-700 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        {a.doctor && typeof a.doctor === 'object' ? (
                          <>
                            <img
                              src={
                                a.doctor?.image?.startsWith('http') 
                                  ? a.doctor.image 
                                  : a.doctor?.image?.startsWith('/') 
                                  ? `${API.defaults.baseURL}${a.doctor.image}`
                                    : `${API.defaults.baseURL}/uploads/${a.doctor?.image}`
                              }
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-100"
                              alt=""
                              onError={(e) => e.target.src = "https://via.placeholder.com/40"}
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-blue-600 text-xs sm:text-sm">{a.doctor?.name || 'Unknown Doctor'}</span>
                              <span className="text-[8px] sm:text-[10px] px-2 py-0.5 bg-blue-50 text-blue-400 rounded-full w-fit">{a.doctor?.speciality || 'General'}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-600 text-xs sm:text-sm">Doctor ID: {a.doctor}</span>
                            <span className="text-[8px] sm:text-[10px] px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full w-fit">Loading...</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700 text-xs sm:text-sm">{a.date}</span>
                        <span className="text-gray-400 flex items-center gap-1 text-[10px] sm:text-xs"><Clock size={10} className="sm:w-3 sm:h-3" /> {a.time}</span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      {a.cancelled ? (
                        <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-red-200">CANCELLED</span>
                      ) : a.isCompleted ? (
                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-green-200">COMPLETED</span>
                      ) : a.status === 'confirmed' ? (
                        <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-blue-200">CONFIRMED</span>
                      ) : a.status === 'rejected' ? (
                        <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-red-200">REJECTED</span>
                      ) : (
                        <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-yellow-200">PENDING</span>
                      )}
                    </td>

                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <div className="flex justify-center text-gray-400">
                        <span className="text-xs font-medium">View Only</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                    No appointments scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
