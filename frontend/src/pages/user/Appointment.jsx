import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { hello } from "../../assets/assets_frontend/assets";
import RelatedDoctors from "../../components/RelatedDocters";
import API from "../../utils/api";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, bookAppointment } = useContext(AppContext);
  const navigate = useNavigate();
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [completedSlots, setCompletedSlots] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);
    if (!docInfo?.workingHours?.breaks?.length) return false;
    
    const convertTo24 = (timeStr) => {
      if (timeStr.includes(' ')) {
        const [t, period] = timeStr.split(' ');
        let [hours, minutes] = t.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      }
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const slotTime = convertTo24(time);
    
    return docInfo.workingHours.breaks.some(brk => {
      const breakStart = convertTo24(brk.start);
      const breakEnd = convertTo24(brk.end);
      return slotTime >= breakStart && slotTime <= breakEnd;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    
    // Check for confirmed appointments
    checkConfirmedAppointments();
  }, [navigate]);

  useEffect(() => {
    const doc = doctors.find((d) => d._id === docId);
    setDocInfo(doc);
  }, [doctors, docId]);

  useEffect(() => {
    if (!docInfo) return;
    
    // Fetch booked slots for this doctor
    const fetchBookedSlots = async () => {
      try {
        const res = await fetch(`${API.defaults.baseURL}/api/appointments/doctor/${docInfo._id}`);
        const data = await res.json();
        const booked = data.filter(apt => !apt.cancelled && apt.status !== 'rejected' && apt.status !== 'completed')
          .map(apt => `${apt.date}-${apt.time}`);
        const completed = data.filter(apt => apt.status === 'completed')
          .map(apt => `${apt.date}-${apt.time}`);
        setBookedSlots(booked);
        setCompletedSlots(completed);
      } catch (err) {
        console.log('Error fetching booked slots:', err);
      }
    };
    
    fetchBookedSlots();
    
    const times = [
      "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", 
      "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", 
      "08:00 PM", "08:30 PM", "09:00 PM"
    ];
    
    // Filter times based on doctor's working hours
    const filterTimesByWorkingHours = (times) => {
      if (!docInfo.workingHours) return times;
      
      const convertTo24 = (time) => {
        const [timeStr, period] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      const startTime = convertTo24(docInfo.workingHours.start);
      const endTime = convertTo24(docInfo.workingHours.end);
      
      return times.filter(time => {
        const slotTime = convertTo24(time);
        return slotTime >= startTime && slotTime <= endTime;
      });
    };
    
    const filteredTimes = filterTimesByWorkingHours(times);

    const today = new Date();
    const slots = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      slots.push({
        day: daysOfWeek[currentDate.getDay()],
        date: currentDate.getDate(),
        times: filteredTimes,
        fullDate: currentDate.toISOString().split("T")[0],
      });
    }

    setDocSlots(slots);
  }, [docInfo]);

  const handleBookAppointment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (slotIndex === null || !slotTime) return alert("Please select a date and time slot");

    const selectedSlot = docSlots[slotIndex];
    if (!selectedSlot) return alert("Please select a valid date slot");

    const appointmentData = {
      doctor: docInfo._id,
      speciality: docInfo.speciality,
      date: selectedSlot.fullDate,
      time: slotTime,
    };

    try {
      await bookAppointment(appointmentData);
      setShowPopup(true);
      setTimeout(() => { setShowPopup(false); navigate("/my-appointments"); }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Booking failed");
    }
  };

  if (!docInfo) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4">
      {/* Doctor Header Card */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
        {/* Profile Image Column */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img
              className="relative w-full aspect-[4/5] object-cover bg-blue-500 rounded-3xl shadow-2xl"
              src={docInfo.image}
              alt={docInfo.name}
            />
          </div>
        </div>

        {/* Doctor Info Details Column */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6">
          <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-4 sm:p-8 rounded-3xl shadow-sm">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">
                {docInfo.name}
              </h1>
              <img className="w-5 h-5 sm:w-6 sm:h-6" src={hello.verified_icon} alt="Verified" />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-bold border border-blue-100">
                <span>{docInfo.degree}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs sm:text-sm font-bold border border-indigo-100">
                <span>{docInfo.speciality}</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 bg-gray-50 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">
                {docInfo.experience} EXP
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  About Clinician <img className="w-3 h-3 sm:w-4 sm:h-4" src={hello.info_icon} alt="" />
                </p>
              </div>
              <p className="text-slate-500 leading-relaxed text-sm sm:text-[15px] font-medium">
                {docInfo.about}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-50 pt-4 sm:pt-6 gap-4 sm:gap-0">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Consultation Fee</span>
                <p className="text-xl sm:text-2xl font-black text-slate-800">
                  {currencySymbol}{docInfo.fees}
                </p>
              </div>
              <div className="flex flex-col text-left sm:text-right">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location</span>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  {docInfo.address?.line1 || "Clinic Address"}, {docInfo.address?.line2 || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 bg-white rounded-3xl p-4 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="w-1.5 h-4 sm:h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">Select Booking Slot</h2>
        </div>

        {!docInfo.available ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Doctor Currently Unavailable</h3>
            <p className="text-gray-500">This doctor is not accepting appointments at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">
          {/* Day Selector */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-widest pl-1">Available Dates</p>
            <div className="flex gap-2 sm:gap-4 items-center w-full overflow-x-auto pb-4 no-scrollbar">
              {docSlots.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => { setSlotIndex(index); setSlotTime(""); }}
                  className={`text-center py-3 sm:py-5 min-w-[80px] sm:min-w-[100px] rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300 transform ${slotIndex === index
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105"
                    : "bg-gray-50 text-slate-600 hover:bg-gray-100"
                    }`}
                >
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1">{slot.day}</p>
                  <p className="text-lg sm:text-2xl font-black">{slot.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-widest pl-1">Preferred Time</p>
            <div className="flex items-center gap-2 sm:gap-3 w-full overflow-x-auto pb-4 no-scrollbar">
              {slotIndex !== null && docSlots[slotIndex] && docSlots[slotIndex].times.map((time, index) => {
                const selectedDate = docSlots[slotIndex].fullDate;
                const slotKey = `${selectedDate}-${time}`;
                const isCompleted = completedSlots.includes(slotKey);
                const isBooked = bookedSlots.includes(slotKey);
                const isBreak = isBreakTime(time);
                
                // Only check past time for today's date
                const today = new Date().toISOString().split('T')[0];
                let isPastTime = false;
                if (selectedDate === today) {
                  const now = new Date();
                  const [timeStr, period] = time.split(' ');
                  let [hours, minutes] = timeStr.split(':').map(Number);
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  const slotTime = hours * 60 + minutes;
                  const currentTime = now.getHours() * 60 + now.getMinutes();
                  isPastTime = slotTime <= currentTime;
                }
                
                // Hide only completed or past time slots (for today only)
                if (isCompleted || isPastTime) return null;
                
                // Get break type for label
                const getBreakLabel = () => {
                  if (!isBreak) return '';
                  
                  const convertTo24 = (timeStr) => {
                    if (timeStr.includes(' ')) {
                      const [t, period] = timeStr.split(' ');
                      let [hours, minutes] = t.split(':').map(Number);
                      if (period === 'PM' && hours !== 12) hours += 12;
                      if (period === 'AM' && hours === 12) hours = 0;
                      return hours * 60 + minutes;
                    }
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    return hours * 60 + minutes;
                  };
                  
                  const [timeStr, period] = time.split(' ');
                  let [hours, minutes] = timeStr.split(':').map(Number);
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  const currentSlotTime = hours * 60 + minutes;
                  
                  const brk = docInfo.workingHours.breaks.find(b => {
                    const breakStart = convertTo24(b.start);
                    const breakEnd = convertTo24(b.end);
                    return currentSlotTime >= breakStart && currentSlotTime <= breakEnd;
                  });
                  
                  if (!brk) return '';
                  
                  const breakName = brk.label || (brk.type === 'tea' ? 'Tea Break' : brk.type === 'lunch' ? 'Lunch Break' : 'Break');
                  const breakStartTime = convertTo24(brk.start);
                  const breakEndTime = convertTo24(brk.end);
                  
                  if (currentSlotTime === breakStartTime) return `${breakName} Start`;
                  if (currentSlotTime === breakEndTime) return `${breakName} End`;
                  return breakName;
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => !isBooked && !isBreak && setSlotTime(time)}
                    disabled={isBooked || isBreak}
                    className={`text-xs sm:text-sm font-bold whitespace-nowrap px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-200 group ${
                      isBreak
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 opacity-60"
                        : isBooked 
                        ? "bg-orange-100 text-orange-600 cursor-not-allowed border border-orange-200"
                        : slotTime === time
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                        : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer"
                    }`}
                  >
                    {time} {isBreak && `(${getBreakLabel()})`} {isBooked && "(Booked)"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Button */}
          <div className="pt-2 sm:pt-4">
            <button
              onClick={handleBookAppointment}
              className="group relative w-full sm:w-80 overflow-hidden rounded-xl sm:rounded-2xl bg-blue-600 px-6 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200"
            >
              <div className="relative flex items-center justify-center gap-2">
                Book Confirmed Appointment
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
            <p className="text-[10px] sm:text-xs text-center sm:text-left text-gray-400 mt-3 sm:mt-4 font-bold uppercase tracking-tighter">
              * Instant confirmation upon clicking the booking button
            </p>
          </div>
        </div>
        )}
      </div>

      {/* Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-md z-[9999] animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 flex flex-col items-center max-w-sm w-full animate-popupSlideIn shadow-blue-900/40">
            <div className="bg-emerald-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-4xl mb-6 shadow-xl shadow-emerald-200 animate-bounce">✓</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 text-center leading-tight">Booking<br />Successful</h2>
            <p className="text-slate-500 font-medium mb-8 text-center text-sm px-4">
              Your session with <span className="text-blue-600 font-bold">{docInfo.name}</span> has been locked into the clinical diary.
            </p>
            <div className="w-full h-[6px] bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-progressBar rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        
        @keyframes popupSlideIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-popupSlideIn { animation: popupSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        
        @keyframes progressBar { from { width: 100%; } to { width: 0%; } }
        .animate-progressBar { animation: progressBar 2s linear forwards; }
      `}</style>

      <div className="mt-20">
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    </div>
  );
};

export default Appointment;
