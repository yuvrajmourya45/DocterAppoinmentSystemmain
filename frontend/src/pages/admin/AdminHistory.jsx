import React, { useEffect, useState } from "react";
import { Calendar, User, Filter, TrendingUp, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import API from "../../utils/api";

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    patientName: "",
    doctorName: "",
    status: ""
  });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get(`/api/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let filtered = res.data.appointments || [];
      
      // Apply filters
      if (filters.startDate && filters.endDate) {
        filtered = filtered.filter(apt => 
          apt.date >= filters.startDate && apt.date <= filters.endDate
        );
      }
      
      if (filters.patientName) {
        filtered = filtered.filter(apt =>
          apt.user?.name?.toLowerCase().includes(filters.patientName.toLowerCase())
        );
      }
      
      if (filters.doctorName) {
        filtered = filtered.filter(apt =>
          apt.doctor?.name?.toLowerCase().includes(filters.doctorName.toLowerCase())
        );
      }
      
      if (filters.status) {
        filtered = filtered.filter(apt => apt.status === filters.status);
      }
      
      // Calculate stats
      const statsData = {
        total: filtered.length,
        completed: filtered.filter(a => a.status === 'completed').length,
        cancelled: filtered.filter(a => a.cancelled).length,
        pending: filtered.filter(a => a.status === 'pending').length,
        confirmed: filtered.filter(a => a.status === 'confirmed').length,
      };
      
      setHistory(filtered);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchHistory();
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", patientName: "", doctorName: "", status: "" });
    setTimeout(() => fetchHistory(), 100);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-3xl font-black text-slate-800 mb-2">📋 Appointment History</h1>
        <p className="text-slate-500 text-sm">Complete record of all appointments with advanced filtering options</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Total</p>
              <p className="text-3xl font-black mt-1">{stats.total || 0}</p>
            </div>
            <TrendingUp size={24} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Completed</p>
              <p className="text-3xl font-black mt-1">{stats.completed || 0}</p>
            </div>
            <CheckCircle size={24} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90">Confirmed</p>
              <p className="text-3xl font-black mt-1">{stats.confirmed || 0}</p>
            </div>
            <Clock size={24} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-4 rounded-2xl text-white shadow-lg">
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
          <h3 className="text-lg font-black text-slate-800">Advanced Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
            <label className="block text-xs font-bold text-slate-600 mb-2">Doctor Name</label>
            <input
              type="text"
              placeholder="Search doctor..."
              value={filters.doctorName}
              onChange={(e) => handleFilterChange('doctorName', e.target.value)}
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
          <h3 className="text-xl font-black text-slate-800">Complete Appointment History ({history.length})</h3>
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
                    <p className="text-sm text-slate-500">{apt.doctor?.name || 'Doctor'}</p>
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
                <th className="text-left p-4 font-bold text-slate-600 uppercase text-xs">Doctor</th>
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
                        <div>
                          <p className="font-bold text-slate-800">{apt.user?.name || 'Patient'}</p>
                          <p className="text-sm text-slate-500">{apt.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{apt.doctor?.name || 'Doctor'}</p>
                      <p className="text-sm text-slate-500">{apt.doctor?.speciality}</p>
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

export default AdminHistory;
