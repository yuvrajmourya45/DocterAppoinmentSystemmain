import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Venus, Edit3, Save, X, Camera } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          {/* Avatar */}
          <div className="flex justify-center -mt-12 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                {imageSrc ? (
                  <img src={imageSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {userData.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isEdit && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
                  <Camera size={14} />
                  <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Name & Email header */}
          <div className="text-center px-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{userData.email}</p>
          </div>

          {/* Fields */}
          <div className="px-6 pb-6 space-y-4">

            {/* Name */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
                {isEdit ? (
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 text-sm font-medium text-gray-800 bg-white border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{userData.name}</p>
                )}
              </div>
            </div>

            {/* Email - always readonly */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{userData.email}</p>
              </div>
            </div>

            {/* Phone - show only if exists or in edit mode */}
            {(isEdit || userData.phone) && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                  {isEdit ? (
                    <input
                      type="tel"
                      value={userData.phone || ""}
                      onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      className="w-full mt-1 text-sm font-medium text-gray-800 bg-white border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{userData.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Gender - show only if exists or in edit mode */}
            {(isEdit || userData.gender) && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Venus size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gender</p>
                  {isEdit ? (
                    <select
                      value={userData.gender || ""}
                      onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full mt-1 text-sm font-medium text-gray-800 bg-white border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{userData.gender}</p>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-2">
              {isEdit ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={16} />}
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEdit(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
