import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { Upload, FileText, Trash2, Download, Calendar, FileCheck } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import API from '../../utils/api';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    documentType: 'lab_report',
    file: null
  });

  const { getUserMedicalRecords } = useContext(AppContext);
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
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await API.get('/api/medical-records/my-records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('documentType', formData.documentType);
    data.append('file', formData.file);

    try {
      await API.post('/api/medical-records/upload', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Medical record uploaded successfully');
      setShowUpload(false);
      setFormData({ title: '', description: '', documentType: 'lab_report', file: null });
      fetchRecords();
      // Update context as well
      getUserMedicalRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/api/medical-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Record deleted');
      fetchRecords();
      // Update context as well
      getUserMedicalRecords();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Medical Records</h1>
          <p className="text-gray-600 text-lg">Manage your health documents securely</p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
            <p className="text-gray-600 mt-1">{records.length} record{records.length !== 1 ? 's' : ''} uploaded</p>
          </div>
          <button 
            onClick={() => setShowUpload(!showUpload)} 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl"
          >
            <Upload size={20} /> Upload New Record
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Upload size={24} />
                Upload Medical Document
              </h3>
              <p className="text-blue-100 text-sm mt-1">Add a new medical record to your profile</p>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Document Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Blood Test Report, Chest X-Ray" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Document Type *</label>
                  <select 
                    value={formData.documentType} 
                    onChange={(e) => setFormData({...formData, documentType: e.target.value})} 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="lab_report">🧪 Lab Report</option>
                    <option value="xray">📷 X-Ray</option>
                    <option value="prescription">💊 Prescription</option>
                    <option value="scan">🔬 Scan (CT/MRI/Ultrasound)</option>
                    <option value="ecg">❤️ ECG/EKG</option>
                    <option value="vaccination">💉 Vaccination Record</option>
                    <option value="discharge_summary">🏥 Discharge Summary</option>
                    <option value="medical_history">🩺 Medical History</option>
                    <option value="allergy_report">⚠️ Allergy Report</option>
                    <option value="other">📄 Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Description (Optional)</label>
                <textarea 
                  placeholder="e.g., Blood test done on 15th Jan 2024, Sugar level normal" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  rows="3" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Upload File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="text-blue-600" size={24} />
                    </div>
                    <input 
                      type="file" 
                      onChange={(e) => setFormData({...formData, file: e.target.files[0]})} 
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, PDF, DOC, DOCX (Max 10MB)</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload Document'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Grid */}
        <div className="grid gap-6">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="text-gray-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">No Medical Records Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Upload your medical documents to share with doctors during consultations</p>
              <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <Upload size={20} />
                  Upload Your First Record
                </button>
            </div>
          ) : (
            records.map((record) => (
              <div key={record._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="text-white" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{record.title}</h3>
                        {record.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{record.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            <FileCheck size={14} />
                            <span className="font-medium">{getDocumentTypeLabel(record.documentType)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar size={14} />
                            <span>{new Date(record.uploadDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <a 
                        href={record.file?.startsWith('http') ? record.file : `${API.defaults.baseURL}/uploads/medical-records/${record.file}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">Download</span>
                      </a>
                      <button 
                        onClick={() => handleDelete(record._id)} 
                        className="p-2 rounded-xl transition-colors text-red-600 hover:bg-red-50"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
