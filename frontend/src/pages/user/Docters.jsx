import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import API from "../../utils/api";

const Docters = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors = [], backendUrl } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    let filtered = doctors.filter(doc => doc.isVerified !== false);
    if (speciality) {
      filtered = filtered.filter((doc) => doc.speciality === speciality);
    }
    setFilterDoc(filtered);
  }, [doctors, speciality]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <p className="text-gray-600 text-sm sm:text-base">
        Browse through the doctors specialist.
      </p>

      <div className="flex flex-col sm:flex-row items-start gap-4 mt-5">
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-blue-500 text-white' : ''}`} onClick={() => setShowFilter(prev => !prev)}>Filters</button>
        {/* Categories */}
        <div className={` flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => speciality === 'General physician' ? navigate('/doctors') : navigate('/doctors/General physician')} className={`w-full sm:w-auto pl-3 py-1.5 pr-4 sm:pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "General physician" ? "bg-indigo-100 text-black" : ""}`}>General physician</p>
          <p onClick={() => speciality === 'Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-4 sm:pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Gynecologist" ? "bg-indigo-100 text-black" : ""}`}>Gynecologist</p>
          <p onClick={() => speciality === 'Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-4 sm:pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Dermatologist" ? "bg-indigo-100 text-black" : ""}`}>Dermatologist</p>
          <p onClick={() => speciality === 'Pediatricians' ? navigate('/doctors') : navigate('/doctors/Pediatricians')} className={`w-full sm:w-auto pl-3 py-1.5 pr-4 sm:pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Pediatricians" ? "bg-indigo-100 text-black" : ""}`}>Pediatricians</p>
          <p onClick={() => speciality === 'Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-4 sm:pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Neurologist" ? "bg-indigo-100 text-black" : ""}`}>Neurologist</p>
          <p onClick={() => speciality === 'Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist')} className={`w-full sm:w-auto pl-3 py-1.5 pr-4 sm:pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Gastroenterologist" ? "bg-indigo-100 text-black" : ""}`}>Gastroenterologist</p>
        </div>

        {/* Doctors grid */}
        <div className="w-full sm:w-3/4">
          {filterDoc.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filterDoc.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/appointment/${item._id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-full h-48 sm:h-56 flex items-center justify-center bg-gray-50">
                    <img
                      src={item.image?.startsWith('http') ? item.image.replace('/uploads//uploads/', '/uploads/') : 
                           item.image ? `${API.defaults.baseURL}${item.image}` : 
                           'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvY3RvciBJbWFnZTwvdGV4dD48L3N2Zz4='}
                      alt={item.name}
                      className="max-h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvY3RvciBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>

                  {/* Doctor info */}
                  <div className="p-3 sm:p-4">
                    <div className={`flex items-center gap-2 text-sm mb-2 ${
                      item.available ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        item.available ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <p>{item.available ? 'Available' : 'Away'}</p>
                      {item.isVerified && <span className="ml-auto text-blue-600 text-xs font-semibold">✓ Verified</span>}
                    </div>
                    <p className="font-medium text-base sm:text-lg text-gray-900">{item.name}</p>
                    <p className="text-gray-600 text-sm">{item.speciality}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {speciality ? `No ${speciality} doctors available` : 'No Doctors Available'}
              </h3>
              <p className="text-gray-500">Please contact admin to add doctors to the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Docters;
