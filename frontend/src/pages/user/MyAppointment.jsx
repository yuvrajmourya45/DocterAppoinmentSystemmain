import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAppointments(token);
  }, []);

  const fetchAppointments = async (token) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      setError("Failed to fetch appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, status) => {
    const msg = status === "confirmed"
      ? "This appointment was confirmed. Are you sure you want to cancel?"
      : "Are you sure you want to cancel?";
    if (!window.confirm(msg)) return;

    try {
      const token = localStorage.getItem("token");
      await API.patch(`/api/appointments/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(prev =>
        prev.map(apt => apt._id === id
          ? { ...apt, cancelled: true, status: "cancelled" }
          : apt
        )
      );
    } catch {
      alert("Failed to cancel appointment");
    }
  };

  const getStatusBadge = (item) => {
    if (item.cancelled) return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Cancelled</span>;
    if (item.isCompleted || item.status === "completed") return <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">Completed</span>;
    if (item.status === "confirmed") return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">Confirmed</span>;
    if (item.status === "rejected") return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Rejected</span>;
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-semibold">Pending</span>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-red-500 font-semibold">{error}</p>
      <button
        onClick={() => fetchAppointments(localStorage.getItem("token"))}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
          <p className="text-gray-500">Manage your upcoming doctor visits</p>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-full p-8 shadow-lg mb-6">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Yet</h3>
            <p className="text-gray-500 mb-6">Book your first appointment today</p>
            <button
              onClick={() => navigate("/doctors")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((item) => {
              const doctorName = item.doctor?.name
                ? (item.doctor.name.startsWith("Dr.") ? item.doctor.name : `Dr. ${item.doctor.name}`)
                : "Doctor";
              const speciality = item.doctor?.speciality || item.speciality || "General";
              const image = item.doctor?.image
                ? item.doctor.image.startsWith("http")
                  ? item.doctor.image
                  : `${API.defaults.baseURL}${item.doctor.image.startsWith("/") ? "" : "/"}${item.doctor.image}`
                : null;

              return (
                <div key={item._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Doctor Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={doctorName}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-3xl font-bold">
                          {doctorName.charAt(doctorName.indexOf(".") + 2) || "D"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{doctorName}</h3>
                    <p className="text-sm text-gray-500 mb-3">{speciality}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{item.time}</span>
                      </div>
                      <div>{getStatusBadge(item)}</div>
                    </div>

                    {!item.cancelled && !item.isCompleted && item.status !== "completed" && item.status !== "rejected" && (
                      <button
                        onClick={() => handleCancel(item._id, item.status)}
                        className="w-full py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition text-sm"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {appointments.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/doctors")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Book Another Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default MyAppointments;
