import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, message: "", type: "info" });
  const navigate = useNavigate();

  // Get user from localStorage (ProtectedRoute already verified auth)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 🔄 Fetch appointments
  const fetchAppointments = async () => {
    if (!user?._id) {
      
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await API.get("/api/appointments",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Manually fetch doctor data for each appointment
      const appointmentsWithDoctors = await Promise.all(
        res.data.map(async (apt) => {
          if (typeof apt.doctor === 'string' && apt.doctor.match(/^[0-9a-fA-F]{24}$/)) {
            try {
              const doctorRes = await API.get(`/api/doctor/profile/${apt.doctor}`);
              return { ...apt, doctor: doctorRes.data };
            } catch (err) {
              
              return apt;
            }
          }
          return apt;
        })
      );
      
      // Check for status changes and show notifications
      if (appointments.length > 0) {
        appointmentsWithDoctors.forEach(newApt => {
          const oldApt = appointments.find(old => old._id === newApt._id);
          if (oldApt && oldApt.status !== newApt.status) {
            const doctorName = newApt.doctor?.name || 'Doctor';
            if (newApt.status === 'confirmed') {
              showPopup(`✅ Your appointment with Dr. ${doctorName} has been CONFIRMED!`, "success");
            } else if (newApt.status === 'rejected') {
              showPopup(`❌ Your appointment with Dr. ${doctorName} has been REJECTED`, "error");
            } else if (newApt.status === 'completed') {
              showPopup(`🏥 Your appointment with Dr. ${doctorName} is COMPLETED`, "success");
            }
          }
        });
      }
      
      setAppointments(appointmentsWithDoctors);
    } catch (err) {
      showPopup("Failed to fetch appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Auto-refresh appointments every 2 seconds to check for updates
  useEffect(() => {
    if (!user?._id) return;
    
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // 🔔 Popup function
  const showPopup = (message, type = "info") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "info" }), 2500);
  };

  // ❌ Cancel appointment
  const handleCancel = async (id, appointmentStatus) => {
    const isConfirmed = appointmentStatus === 'confirmed';
    const confirmMessage = isConfirmed 
      ? "This appointment was already confirmed by the doctor. Are you sure you want to cancel? The doctor will be notified."
      : "Are you sure you want to cancel this appointment?";
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const response = await API.patch(`/api/appointments/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt._id === id 
          ? { ...apt, cancelled: true, status: 'cancelled', cancelledAt: new Date() }
          : apt
      ));
      
      // Show appropriate message
      if (response.data.refundEligible) {
        showPopup("✅ Confirmed appointment cancelled! Doctor notified. Refund will be processed.", "success");
      } else {
        showPopup("✅ Appointment cancelled successfully!", "success");
      }
    } catch (err) {
      console.error('Cancel error:', err);
      showPopup("❌ Failed to cancel appointment", "error");
    }
  };

  // 💰 Pay appointment
  const handlePay = async (id) => {
    showPopup("Payment successful!", "success");
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">My Appointments</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your upcoming doctor visits</p>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-full p-8 shadow-lg mb-6">
              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Appointments Yet</h3>
            <p className="text-gray-500 mb-6">Start your healthcare journey today</p>
            <button
              onClick={() => navigate("/doctors")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {appointments.map((item) => {
                const doctorName = item.doctor?.name ? (item.doctor.name.startsWith('Dr.') ? item.doctor.name : `Dr. ${item.doctor.name}`) : 'Doctor';
                const speciality = item.doctor?.speciality || item.speciality || 'General';
                const image = item.doctor?.image
                  ? item.doctor.image.startsWith('http') ? item.doctor.image : `${API.defaults.baseURL}${item.doctor.image.startsWith('/') ? '' : '/'}${item.doctor.image}`
                  : 'https://via.placeholder.com/300x400/e2e8f0/64748b?text=Doctor';

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <img
                          src={image}
                          alt={doctorName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x400/e2e8f0/64748b?text=Doctor";
                          }}
                        />
                      </div>
                      <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
                        {item.cancelled ? (
                          <span className="text-xs font-semibold text-red-600">Cancelled</span>
                        ) : item.isCompleted ? (
                          <span className="text-xs font-semibold text-green-600">Completed</span>
                        ) : item.status === 'confirmed' ? (
                          <span className="text-xs font-semibold text-blue-600">Confirmed</span>
                        ) : item.status === 'rejected' ? (
                          <span className="text-xs font-semibold text-red-600">Rejected</span>
                        ) : (
                          <span className="text-xs font-semibold text-yellow-600">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 sm:p-5">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{doctorName}</h3>
                      <p className="text-sm text-gray-500 mb-3 sm:mb-4">{speciality}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium">{item.date}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">{item.time}</span>
                        </div>
                        <div className="mt-2">
                          {item.cancelled ? (
                            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Cancelled</span>
                          ) : item.isCompleted ? (
                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">Completed</span>
                          ) : item.status === 'confirmed' ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">Confirmed</span>
                          ) : item.status === 'rejected' ? (
                            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Rejected</span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-semibold">Pending Approval</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {!item.cancelled && !item.isCompleted && (
                          <>
                            <button
                              onClick={() => handlePay(item._id)}
                              className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm"
                            >
                              Pay Now
                            </button>
                            <button
                              onClick={() => handleCancel(item._id, item.status)}
                              className={`flex-1 py-2 sm:py-2.5 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm ${
                                item.status === 'confirmed' 
                                  ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                                  : 'bg-gradient-to-r from-red-500 to-pink-600'
                              }`}
                            >
                              {item.status === 'confirmed' ? 'Cancel Confirmed' : 'Cancel'}
                            </button>
                          </>
                        )}
                        {item.cancelled && (
                          <div className="flex-1 py-2.5 bg-gray-300 text-gray-600 rounded-lg font-semibold text-center">
                            Cancelled on {new Date(item.cancelledAt || item.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                        {item.isCompleted && (
                          <div className="flex-1 py-2.5 bg-green-100 text-green-600 rounded-lg font-semibold text-center">
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate("/doctors")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Book Another Appointment
              </button>
            </div>
          </>
        )}

      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all animate-scaleIn">
            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 mx-auto text-2xl text-white shadow-lg
              ${popup.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`}>
              {popup.type === "success" ? "✓" : "ℹ"}
            </div>
            <p className="text-center text-gray-800 font-semibold text-lg">{popup.message}</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MyAppointments;
