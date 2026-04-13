import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { FileText, Download, X, Calendar, FileCheck, Loader, User, Mail, Phone, MapPin } from 'lucide-react';

const PatientMedicalRecords = ({ patientId, onClose }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState(null);
  const token = localStorage.getItem('token');

  const getDocumentTypeLabel = (type) => {
    const labels = {
      'lab_report': '🧪 Lab Report',
      'xray': '📷 X-Ray',
      'prescription': '💊 Prescription',
      'scan': '🔬 Scan',
      'ecg': '❤️ ECG/EKG',
      'vaccination': '💉 Vaccination',
      'discharge_summary': '🏥 Discharge Summary',
      'medical_history': '🩺 Medical History',
      'allergy_report': '⚠️ Allergy Report',
      'other': '📄 Other'
    };
    return labels[type] || type;
  };

  useEffect(() => {
    fetchRecords();
    fetchPatientInfo();
  }, [patientId]);

  const fetchPatientInfo = async () => {
    try {
      const res = await API.get(`/api/user/profile/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientInfo(res.data);
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/medical-records/user/${patientId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      setRecords(res.data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">Patient Medical Records</h2>
            <p className="text-blue-100 text-sm mt-1">Complete patient information and medical documents</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {/* Patient Info Section */}
          {patientInfo && (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                  {patientInfo.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{patientInfo.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={16} className="text-blue-600" />
                      <span className="text-sm">{patientInfo.email}</span>
                    </div>
                    {patientInfo.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={16} className="text-blue-600" />
                        <span className="text-sm">{patientInfo.phone}</span>
                      </div>
                    )}
                    {patientInfo.address && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={16} className="text-blue-600" />
                        <span className="text-sm">{patientInfo.address.line1}, {patientInfo.address.line2}</span>
                      </div>
                    )}
                    {patientInfo.dob && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="text-sm">DOB: {new Date(patientInfo.dob).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                    {patientInfo.gender && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User size={16} className="text-blue-600" />
                        <span className="text-sm capitalize">{patientInfo.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical Records Section */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" size={24} />
              Medical Documents ({records.length})
            </h3>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-gray-500">Loading medical records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl">
                <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Medical Records Available</h3>
                <p className="text-gray-500">Patient hasn't uploaded any medical documents yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record._id} className="border border-gray-200 p-5 rounded-xl hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                          <FileText className="text-white" size={28} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{record.title}</h3>
                          {record.description && (
                            <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                              <FileCheck size={14} className="text-blue-600" />
                              <span className="font-medium">{getDocumentTypeLabel(record.documentType)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(record.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href={`${API.defaults.baseURL}/uploads/medical-records/${record.file}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        <Download size={18} />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalRecords;
