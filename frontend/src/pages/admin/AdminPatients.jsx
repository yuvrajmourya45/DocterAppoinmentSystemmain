import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import API_URL from "../../utils/api";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);

  // Fetch all patients from backend
  const loadPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await API.get(`/api/admin/users`, config);
      setPatients(res.data);
    } catch (err) {
      console.log("Error loading patients", err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users size={28} />
        <h1 className="text-3xl font-bold">All Patients</h1>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-xl">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left border-b">
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Age</th>
            </tr>
          </thead>

          <tbody>
            {patients.length > 0 ? (
              patients.map((p, index) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.email}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">{p.age}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-5 text-center text-gray-500">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
