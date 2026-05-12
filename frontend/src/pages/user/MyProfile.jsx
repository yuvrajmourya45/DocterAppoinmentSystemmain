import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Edit3, Save, X, Camera, Shield, Calendar, MapPin } from "lucide-react";
import API from "../../utils/api";
import { toast } from "react-toastify";

const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!userData) return;
    setSaving(true);
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("phone", userData.phone || "");
    formData.append("gender", userData.gender || "");
    if (profilePic) formData.append("profilePic", profilePic);
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      const res = await API.put(`/api/auth/profile/${userData._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setUserData(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setIsEdit(false);
      setProfilePic(null);
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
    setProfilePic(null);
    setIsEdit(false);
  };

  const getImageSrc = () => {
    if (profilePic) return URL.createObjectURL(profilePic);
    if (userData?.profilePic) return `${API.defaults.baseURL}${userData.profilePic}`;
    return null;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!userData) return (
    <div className="text-center mt-20 text-gray-600">Please login to view profile</div>
  );

  const imageSrc = getImageSrc();
  const joinDate = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : "Member";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Cover Banner */}
          <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
            </div>
          </div>

          {/* Avatar + Name Row */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-14 mb-4 gap-4">
              {/* Avatar */}
              <div className="relative w-fit">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-4xl font-black">
                      {userData.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {isEdit && (
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl cursor-pointer hover:bg-blue-700 shadow-lg transition">
                    <Camera size={14} />
                    <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} className="hidden" />
                  </label>
                )}
              </div>

              {/* Edit Button */}
              <div className="sm:mb-2">
                {!isEdit ? (
                  <button onClick={() => setIsEdit(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-200">
                    <Edit3 size={15} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-60">
                      {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={15} />}
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={handleCancel}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition">
                      <X size={15} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Name & Role */}
            <div className="mb-1">
              {isEdit ? (
                <input type="text" value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-black text-gray-800 bg-gray-50 border border-blue-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-xs"
                />
              ) : (
                <h2 className="text-2xl font-black text-gray-800">{userData.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  <Shield size={11} /> Patient
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                  <Calendar size={11} /> Joined {joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Email */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{userData.email}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                {isEdit ? (
                  <input type="tel" value={userData.phone || ""}
                    onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full mt-1 text-sm font-semibold text-gray-800 bg-gray-50 border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{userData.phone || <span className="text-gray-400 font-normal">Not added</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</p>
                {isEdit ? (
                  <select value={userData.gender || ""}
                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full mt-1 text-sm font-semibold text-gray-800 bg-gray-50 border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{userData.gender || <span className="text-gray-400 font-normal">Not added</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-emerald-600">Active & Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
