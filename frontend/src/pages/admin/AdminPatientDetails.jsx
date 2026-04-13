import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, Trash2, Download, User, Activity, Heart, Pill } from 'lucide-react';
import { toast } from 'react-toastify';
import API_URL from '../../utils/api';

const AdminPatientDetails = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('token');
      
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
      toast.error('Failed to load patient data');
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId) => {
    if (!confirm('Delete this record?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/admin/patients/${patientId}/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Record deleted');
      fetchPatientData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-slate-100">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700 font-semibold transition-colors"
      >
        <ArrowLeft size={20} /> Back to Patients
      </button>

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {patient?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{patient?.name}</h1>
            <p className="text-blue-100">{patient?.email}</p>
          </div>
        </div>
      </div>

      {/* Medical History - Only show if data exists */}
      {(patient?.medicalHistory?.bloodGroup || 
        patient?.medicalHistory?.allergies?.length > 0 || 
        patient?.medicalHistory?.chronicDiseases?.length > 0 || 
        patient?.medicalHistory?.previousSurgeries?.length > 0) && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-emerald-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Medical History</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient?.medicalHistory?.bloodGroup && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                <p className="text-lg font-bold text-slate-800">{patient.medicalHistory.bloodGroup}</p>
              </div>
            )}
            {patient?.medicalHistory?.allergies?.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Allergies</p>
                <p className="text-sm font-semibold text-red-600">{patient.medicalHistory.allergies.join(', ')}</p>
              </div>
            )}
            {patient?.medicalHistory?.chronicDiseases?.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chronic Diseases</p>
                <p className="text-sm font-semibold text-orange-600">{patient.medicalHistory.chronicDiseases.join(', ')}</p>
              </div>
            )}
            {patient?.medicalHistory?.previousSurgeries?.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Previous Surgeries</p>
                <p className="text-sm font-semibold text-purple-600">{patient.medicalHistory.previousSurgeries.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medical Records */}
      <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Medical Records</h2>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
            {patient?.medicalRecords?.length || 0} Files
          </span>
        </div>
        
        {patient?.medicalRecords?.length > 0 ? (
          <div className="space-y-3">
            {patient.medicalRecords.map(record => (
              <div key={record._id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 mb-1">{record.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{record.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={14} />
                        <span>{new Date(record.uploadDate).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={`${API_URL}/uploads/medical-records/${record.file}`} 
                      target="_blank" 
                      className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                    <button 
                      onClick={() => deleteRecord(record._id)}
                      className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-400 font-medium">No medical records uploaded yet</p>
          </div>
        )}
      </div>

      {/* Appointment History */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-violet-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">Appointment History</h2>
            </div>
            <span className="px-3 py-1 bg-violet-100 text-violet-600 rounded-full text-sm font-bold">
              {appointments.length} Total
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(apt => (
                <div key={apt._id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        Dr
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Dr. {apt.doctor?.name}</p>
                        <p className="text-sm text-slate-500">{apt.doctor?.speciality}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      apt.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      apt.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <Calendar size={16} />
                    <span>{apt.date} at {apt.time}</span>
                  </div>
                  
                  {apt.prescription && apt.prescription.diagnosis && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="text-blue-600" size={20} />
                        <p className="font-bold text-slate-800">Prescription</p>
                      </div>
                      <p className="text-sm mb-2"><strong>Diagnosis:</strong> {apt.prescription.diagnosis}</p>
                      {apt.prescription.medicines?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-bold mb-1">Medicines:</p>
                          <ul className="space-y-1">
                            {apt.prescription.medicines.map((med, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>{med.name} - {med.dosage} ({med.frequency})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {apt.prescription.notes && (
                        <p className="text-sm text-slate-600"><strong>Notes:</strong> {apt.prescription.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-400 font-medium">No appointments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPatientDetails;
