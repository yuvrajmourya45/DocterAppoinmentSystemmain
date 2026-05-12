import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import API from '../utils/api';

const TopDoctor = () => {
  const navigate = useNavigate()
  const { doctors, doctorsLoading } = useContext(AppContext)

  if (doctorsLoading) return (
    <div className='flex flex-col items-center gap-4 my-8 lg:my-16 px-4'>
      <h1 className='text-2xl lg:text-3xl font-medium'>Top Doctors to Book</h1>
      <div className='w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='border border-gray-200 rounded-xl overflow-hidden animate-pulse'>
            <div className='bg-gray-200 w-full h-40 lg:h-48'></div>
            <div className='p-3'>
              <div className='h-3 bg-gray-200 rounded mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-2/3'></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className='flex flex-col items-center gap-4 my-8 lg:my-16 text-gray-900 px-4 lg:px-10'>
      <h1 className='text-2xl lg:text-3xl font-medium text-center'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm lg:text-base'>Simply browse through our extensive list of trusted doctors.</p>

      {doctors && doctors.length > 0 ? (
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5 pt-3 lg:pt-5'>
          {doctors.slice(0, 10).map((item, index) => (
            <div
              onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0) }}
              className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 bg-white shadow-sm hover:shadow-md'
              key={index}
            >
              <img
                className='bg-blue-50 w-full h-40 lg:h-48 object-cover'
                src={item.image?.startsWith('http') ? item.image : item.image ? `${API.defaults.baseURL}${item.image}` : ''}
                alt={item.name}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className='p-3 lg:p-4'>
                <div className={`flex items-center gap-2 text-xs lg:text-sm ${item.available !== false ? 'text-green-500' : 'text-red-500'}`}>
                  <p className={`w-2 h-2 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-red-500'}`}></p>
                  <p>{item.available !== false ? 'Available' : 'Away'}</p>
                </div>
                <p className='font-medium text-base lg:text-lg text-gray-900 truncate'>{item.name}</p>
                <p className='text-gray-600 text-sm truncate'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='w-full text-center py-10'>
          <p className='text-gray-500'>No doctors available yet.</p>
        </div>
      )}

      {doctors && doctors.length > 0 && (
        <button
          onClick={() => { navigate('/doctors'); window.scrollTo(0, 0) }}
          className='bg-blue-50 text-gray-600 px-8 lg:px-12 py-2 lg:py-3 rounded-full mt-6 lg:mt-10 text-sm lg:text-base hover:bg-blue-100 transition-colors'
        >
          More
        </button>
      )}
    </div>
  )
}

export default TopDoctor