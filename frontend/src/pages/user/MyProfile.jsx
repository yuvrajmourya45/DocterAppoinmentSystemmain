import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!userData) return;

    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("phone", userData.phone || "");
    formData.append("gender", userData.gender || "");
    if (profilePic) formData.append("profilePic", profilePic);

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await API.put(
        `/api/auth/profile/${userData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Profile updated successfully!");
      setUserData(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setIsEdit(false);
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      alert("❌ Error updating profile");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (!userData) return <div className="text-center mt-20 text-gray-600">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 my-10">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">My Profile</h1>
        
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={
                profilePic
                  ? URL.createObjectURL(profilePic)
                  : userData.profilePic
                  ? `${API.defaults.baseURL}${userData.profilePic}`
                  : "https://via.placeholder.com/120"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md"
            />
            {isEdit && (
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            {isEdit ? (
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">{userData.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600 break-all overflow-hidden">{userData.email}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            {isEdit ? (
              <input
                type="text"
                value={userData.phone || ""}
                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">{userData.phone || "Not set"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            {isEdit ? (
              <select
                value={userData.gender || ""}
                onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">{userData.gender || "Not set"}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center mt-8">
          {isEdit ? (
            <>
              <button 
                onClick={handleSave} 
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEdit(false)} 
                className="px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEdit(true)} 
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
