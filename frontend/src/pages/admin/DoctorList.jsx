import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Trash2, Edit, Search, UserCheck, UserX } from "lucide-react";
import API_URL from "../../utils/api";

export default function DoctorList() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.get(`/api/admin/doctors`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDoctors(res.data);
        } catch (err) {
            toast.error("Failed to fetch doctors");
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await API.post(`/api/admin/change-availability`, { docId: id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Availability updated");
            fetchDoctors();
        } catch (err) {
            toast.error("Failed to update availability");
        }
    };

    const toggleVerification = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await API.post(`/api/admin/verify-doctor`, { docId: id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Verification status updated");
            fetchDoctors();
        } catch (err) {
            toast.error("Failed to update verification");
        }
    };

    const deleteDoctor = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`/api/admin/doctors/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Doctor deleted successfully");
            fetchDoctors();
        } catch (err) {
            toast.error("Failed to delete doctor");
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Doctors Management</h2>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm">Doctor</th>
                                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm hidden sm:table-cell">Speciality</th>
                                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm hidden md:table-cell">Contact</th>
                                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm">Fees</th>
                                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm hidden lg:table-cell">Verified</th>
                                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm">Status</th>
                                <th className="p-2 sm:p-4 font-semibold text-gray-600 text-xs sm:text-sm text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doctor) => (
                                    <tr key={doctor._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-2 sm:p-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <img
                                                    src={doctor.image?.startsWith('http') ? doctor.image : `${API_URL}${doctor.image}`}
                                                    alt={doctor.name}
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-100 flex-shrink-0"
                                                    onError={(e) => e.target.src = "https://via.placeholder.com/40"}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{doctor.name}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 sm:hidden truncate">{doctor.speciality}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block truncate">{doctor.degree}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell">
                                            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium">
                                                {doctor.speciality}
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-4 hidden md:table-cell">
                                            <div className="text-xs sm:text-sm">
                                                <p className="text-gray-700 break-all">{doctor.email}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-400">
                                                    {typeof doctor.address === 'object'
                                                        ? `${doctor.address.line1}, ${doctor.address.line2}`
                                                        : doctor.address}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="p-2 sm:p-4 font-medium text-gray-800 text-xs sm:text-sm">${doctor.fees}</td>
                                        <td className="p-2 sm:p-4 hidden lg:table-cell">
                                            <button
                                                onClick={() => toggleVerification(doctor._id)}
                                                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full transition-all text-[10px] sm:text-xs ${doctor.isVerified ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'}`}
                                            >
                                                <span className="font-semibold">{doctor.isVerified ? '✓ Verified' : '⏳ Pending'}</span>
                                            </button>
                                        </td>
                                        <td className="p-2 sm:p-4">
                                            <button
                                                onClick={() => toggleAvailability(doctor._id)}
                                                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full transition-all text-[10px] sm:text-xs ${doctor.available ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                                            >
                                                {doctor.available ? <UserCheck size={12} className="sm:w-3.5 sm:h-3.5" /> : <UserX size={12} className="sm:w-3.5 sm:h-3.5" />}
                                                <span className="font-semibold hidden sm:inline">{doctor.available ? 'Active' : 'Hidden'}</span>
                                            </button>
                                        </td>
                                        <td className="p-2 sm:p-4">
                                            <div className="flex justify-center gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => deleteDoctor(doctor._id)}
                                                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400">
                                        No doctors found matching your search.
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
