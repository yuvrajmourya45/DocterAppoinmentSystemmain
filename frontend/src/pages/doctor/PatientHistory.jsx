import React, { useEffect, useState } from "react";
import { Calendar, User, Filter, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import API_URL from "../../utils/api";

const PatientHistory = ({ doctorId }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    patientName: "",
    status: ""
  });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.patientName) params.append('patientName', filters.patientName);
      if (filters.status) params.append('status', filters.status);
      
      const res = await API.get(`/api/doctor/history/${doctorId}?${params}`);
      setHistory(res.data.appointments);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) fetchHistory();
  }, [doctorId]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchHistory();
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", patientName: "", status: "" });
    setTimeout(() => fetchHistory(), 100);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Total</p>
              <p className="text-3xl font-black mt-1">{stats.total || 0}</p>
            </div>
            <TrendingUp size={24} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Completed</p>
              <p className="text-3xl font-black mt-1">{stats.completed || 0}</p>
            </div>
            <CheckCircle size={24} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Confirmed</p>
              <p className="text-3xl font-black mt-1">{stats.confirmed || 0}</p>
            </div>
            <Clock size={24} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Pending</p>
              <p className="text-3xl font-black mt-1">{stats.pending || 0}</p>
            </div>
            <Clock size={24} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Cancelled</p>
              <p className="text-3xl font-black mt-1">{stats.cancelled || 0}</p>
            </div>
            <XCircle size={24} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Visual Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-black text-slate-800 mb-6">Appointment Status Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Completed</span>
                <span className="text-sm font-bold text-green-600">{stats.completed || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total ? (stats.completed / stats.total * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Confirmed</span>
                <span className="text-sm font-bold text-yellow-600">{stats.confirmed || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total ? (stats.confirmed / stats.total * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Pending</span>
                <span className="text-sm font-bold text-orange-600">{stats.pending || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total ? (stats.pending / stats.total * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-slate-600">Cancelled</span>
                <span className="text-sm font-bold text-red-600">{stats.cancelled || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total ? (stats.cancelled / stats.total * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart (Donut) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-black text-slate-800 mb-6">Status Overview</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {(() => {
                  const total = stats.total || 1;
                  const completed = ((stats.completed || 0) / total) * 100;
                  const confirmed = ((stats.confirmed || 0) / total) * 100;
                  const pending = ((stats.pending || 0) / total) * 100;
                  const cancelled = ((stats.cancelled || 0) / total) * 100;
                  
                  let offset = 0;
                  const radius = 40;
                  const circumference = 2 * Math.PI * radius;
                  
                  return (
                    <>
                      {/* Completed */}
                      <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${(completed / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-offset}
                      />
                      {(() => { offset += (completed / 100) * circumference; return null; })()}
                      
                      {/* Confirmed */}
                      <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="20"
                        strokeDasharray={`${(confirmed / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-offset}
                      />
                      {(() => { offset += (confirmed / 100) * circumference; return null; })()}
                      
                      {/* Pending */}
                      <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="20"
                        strokeDasharray={`${(pending / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-offset}
                      />
                      {(() => { offset += (pending / 100) * circumference; return null; })()}
                      
                      {/* Cancelled */}
                      <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray={`${(cancelled / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-offset}
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-800">{stats.total || 0}</p>
                  <p className="text-xs font-bold text-slate-500">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs font-bold text-slate-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs font-bold text-slate-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs font-bold text-slate-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs font-bold text-slate-600">Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-600" />
          <h3 className="text-lg font-black text-slate-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Patient Name</label>
            <input
              type="text"
              placeholder="Search patient..."
              value={filters.patientName}
              onChange={(e) => handleFilterChange('patientName', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-800">Patient History ({history.length})</h3>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No appointments found</div>
          ) : (
            history.map((apt) => (
              <div key={apt._id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{apt.user?.name || 'Patient'}</p>
                    <p className="text-sm text-slate-500">{apt.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-slate-800">{apt.date}</p>
                    <p className="text-slate-500">{apt.time}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {apt.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs">Patient</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs">Contact</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs">Date</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs">Time</th>
                <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">No appointments found</td>
                </tr>
              ) : (
                history.map((apt) => (
                  <tr key={apt._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <p className="font-bold text-slate-800">{apt.user?.name || 'Patient'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-600">{apt.user?.email}</p>
                      <p className="text-sm text-slate-500">{apt.user?.phone || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{apt.date}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{apt.time}</p>
                    </td>
                    <td className="p-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
