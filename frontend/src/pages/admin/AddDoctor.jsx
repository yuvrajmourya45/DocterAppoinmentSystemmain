import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Upload, X, Save, Plus, Trash2, Coffee, Utensils } from "lucide-react";
import API_URL from "../../utils/api";

export default function AddDoctor() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        speciality: "General physician",
        degree: "",
        experience: "1 Year",
        fees: "",
        about: "",
        addressLine1: "",
        addressLine2: "",
        available: true,
        isVerified: false,
        workingHoursStart: "08:00 AM",
        workingHoursEnd: "05:00 PM",
        breaks: [],
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("speciality", formData.speciality);
        data.append("degree", formData.degree);
        data.append("experience", formData.experience);
        data.append("fees", formData.fees);
        data.append("about", formData.about);
        data.append("address", JSON.stringify({ line1: formData.addressLine1, line2: formData.addressLine2 }));
        data.append("workingHours", JSON.stringify({ start: formData.workingHoursStart, end: formData.workingHoursEnd, breaks: formData.breaks }));
        data.append("available", formData.available);
        data.append("isVerified", formData.isVerified);
        if (image) data.append("image", image);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${API_URL}/api/admin/add-doctor`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success(res.data.message);
            // Reset form
            setFormData({
                name: "",
                email: "",
                password: "",
                speciality: "General physician",
                degree: "",
                experience: "1 Year",
                fees: "",
                about: "",
                addressLine1: "",
                addressLine2: "",
                available: true,
                isVerified: false,
                workingHoursStart: "08:00 AM",
                workingHoursEnd: "05:00 PM",
                breaks: [],
            });
            setImage(null);
            setImagePreview(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error adding doctor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Add New Doctor</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors bg-gray-50 cursor-pointer relative">
                    {imagePreview ? (
                        <div className="relative">
                            <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                            <button
                                type="button"
                                onClick={() => { setImage(null); setImagePreview(null); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                            <Upload className="text-gray-400 mb-2" size={40} />
                            <span className="text-gray-500 font-medium">Upload Doctor Photo</span>
                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Doctor Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Dr. Richard James" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Doctor Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="doctor@example.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Doctor Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Enter password" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Speciality</label>
                        <select name="speciality" value={formData.speciality} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                            <option value="General physician">General physician</option>
                            <option value="Gynecologist">Gynecologist</option>
                            <option value="Dermatologist">Dermatologist</option>
                            <option value="Pediatricians">Pediatricians</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Gastroenterologist">Gastroenterologist</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Education / Degree</label>
                        <input type="text" name="degree" value={formData.degree} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="MBBS, MD, etc." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Experience</label>
                        <select name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                            {[...Array(10)].map((_, i) => (
                                <option key={i} value={`${i + 1} Year`}>{i + 1} Year</option>
                            ))}
                            <option value="10+ Year">10+ Year</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Fees ($)</label>
                        <input type="number" name="fees" value={formData.fees} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. 50" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Address Line 1</label>
                        <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="17th Cross, Richmond" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Address Line 2</label>
                        <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Circle, Ring Road, London" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Working Hours Start</label>
                        <select name="workingHoursStart" value={formData.workingHoursStart} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                            <option value="08:00 AM">08:00 AM</option>
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Working Hours End</label>
                        <select name="workingHoursEnd" value={formData.workingHoursEnd} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                            <option value="03:00 PM">03:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="05:00 PM">05:00 PM</option>
                            <option value="06:00 PM">06:00 PM</option>
                            <option value="07:00 PM">07:00 PM</option>
                            <option value="08:00 PM">08:00 PM</option>
                            <option value="09:00 PM">09:00 PM</option>
                        </select>
                    </div>
                </div>

                {/* Breaks Section */}
                <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">Breaks (Tea/Lunch)</label>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, breaks: [...formData.breaks, { type: 'tea', start: '10:00 AM', end: '10:15 AM', label: '' }]})}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                            <Plus size={16} /> Add Break
                        </button>
                    </div>
                    {formData.breaks.map((brk, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg border">
                            <select
                                value={brk.type}
                                onChange={(e) => {
                                    const newBreaks = [...formData.breaks];
                                    newBreaks[idx].type = e.target.value;
                                    setFormData({...formData, breaks: newBreaks});
                                }}
                                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="tea">☕ Tea</option>
                                <option value="lunch">🍽️ Lunch</option>
                                <option value="other">Other</option>
                            </select>
                            <input
                                type="text"
                                value={brk.start}
                                onChange={(e) => {
                                    const newBreaks = [...formData.breaks];
                                    newBreaks[idx].start = e.target.value;
                                    setFormData({...formData, breaks: newBreaks});
                                }}
                                placeholder="10:00 AM"
                                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                value={brk.end}
                                onChange={(e) => {
                                    const newBreaks = [...formData.breaks];
                                    newBreaks[idx].end = e.target.value;
                                    setFormData({...formData, breaks: newBreaks});
                                }}
                                placeholder="10:15 AM"
                                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                value={brk.label}
                                onChange={(e) => {
                                    const newBreaks = [...formData.breaks];
                                    newBreaks[idx].label = e.target.value;
                                    setFormData({...formData, breaks: newBreaks});
                                }}
                                placeholder="Label (optional)"
                                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, breaks: formData.breaks.filter((_, i) => i !== idx)})}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">About Doctor</label>
                    <textarea name="about" value={formData.about} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32" placeholder="Write about the doctor's achievements and expertise..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <input 
                            type="checkbox" 
                            name="available" 
                            checked={formData.available} 
                            onChange={(e) => setFormData({...formData, available: e.target.checked})} 
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                        />
                        <label className="text-sm font-semibold text-gray-700">Available for Appointments</label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <input 
                            type="checkbox" 
                            name="isVerified" 
                            checked={formData.isVerified} 
                            onChange={(e) => setFormData({...formData, isVerified: e.target.checked})} 
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                        />
                        <label className="text-sm font-semibold text-gray-700">Verified Doctor</label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <Save size={20} /> Add Doctor
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
