import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';

const AdminPatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const [recordsRes, appointmentsRes] = await Promise.all([
        API.get(`/api/admin/patients/${patientId}/medical-records`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        API.get(`/api/admin/patients/${patientId}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPatient(recordsRes.data.patient);
      setAppointments(appointmentsRes.data.appointments);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId) => {
    if (!confirm('Delete this record?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await API.delete(`/api/admin/patients/${patientId}/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPatientData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Patient Details: {patient?.name}</h1>

      {/* Medical History */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Medical History</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Blood Group</p>
            <p className="font-medium">{patient?.medicalHistory?.bloodGroup || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Allergies</p>
            <p className="font-medium">{patient?.medicalHistory?.allergies?.join(', ') || 'None'}</p>
          </div>
          <div>
            <p className="text-gray-600">Chronic Diseases</p>
            <p className="font-medium">{patient?.medicalHistory?.chronicDiseases?.join(', ') || 'None'}</p>
          </div>
          <div>
            <p className="text-gray-600">Previous Surgeries</p>
            <p className="font-medium">{patient?.medicalHistory?.previousSurgeries?.join(', ') || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Medical Records */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Medical Records</h2>
        {patient?.medicalRecords?.length > 0 ? (
          <div className="space-y-3">
            {patient.medicalRecords.map(record => (
              <div key={record._id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{record.description}</p>
                  <p className="text-sm text-gray-600">{record.fileName}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(record.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`${import.meta.env.VITE_BACKEND_URL || 'https://docterappoinmentsystemmain.onrender.com'}/${record.filePath}`} 
                    target="_blank" 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => deleteRecord(record._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No medical records uploaded</p>
        )}
      </div>

      {/* Appointment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Appointment History</h2>
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt._id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Dr. {apt.doctor?.name}</p>
                    <p className="text-sm text-gray-600">{apt.doctor?.speciality}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${
                    apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                    apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {apt.date} at {apt.time}
                </p>
                
                {apt.prescription && (
                  <div className="mt-3 bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm mb-2">Prescription:</p>
                    <p className="text-sm"><strong>Diagnosis:</strong> {apt.prescription.diagnosis}</p>
                    {apt.prescription.medicines?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold">Medicines:</p>
                        <ul className="list-disc list-inside text-sm">
                          {apt.prescription.medicines.map((med, i) => (
                            <li key={i}>{med.name} - {med.dosage} ({med.frequency})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {apt.prescription.notes && (
                      <p className="text-sm mt-2"><strong>Notes:</strong> {apt.prescription.notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default AdminPatientDetails;
