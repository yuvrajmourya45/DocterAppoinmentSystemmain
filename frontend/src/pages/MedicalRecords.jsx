import { useState, useEffect } from 'react';
import API from '../utils/api';

const MedicalRecords = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [records, setRecords] = useState([]);
  const [history, setHistory] = useState({
    bloodGroup: '',
    allergies: [],
    chronicDiseases: [],
    previousSurgeries: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/api/medical-records/my-records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data.records || []);
      setHistory(res.data.history || {});
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    try {
      const token = localStorage.getItem('token');
      await API.post('/api/medical-records/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Record uploaded successfully');
      setFile(null);
      setDescription('');
      fetchRecords();
    } catch (error) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await API.put('/api/medical-records/medical-history', history, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Medical history updated');
    } catch (error) {
      alert('Update failed');
    }
  };

  const deleteRecord = async (recordId) => {
    if (!confirm('Delete this record?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/medical-records/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecords();
    } catch (error) {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>

      {/* Medical History Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Medical History</h2>
        <form onSubmit={handleHistoryUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Blood Group</label>
            <input
              type="text"
              value={history.bloodGroup || ''}
              onChange={(e) => setHistory({...history, bloodGroup: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., A+"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Allergies (comma separated)</label>
            <input
              type="text"
              value={history.allergies?.join(', ') || ''}
              onChange={(e) => setHistory({...history, allergies: e.target.value.split(',').map(s => s.trim())})}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Penicillin, Peanuts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chronic Diseases (comma separated)</label>
            <input
              type="text"
              value={history.chronicDiseases?.join(', ') || ''}
              onChange={(e) => setHistory({...history, chronicDiseases: e.target.value.split(',').map(s => s.trim())})}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Diabetes, Hypertension"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Previous Surgeries (comma separated)</label>
            <input
              type="text"
              value={history.previousSurgeries?.join(', ') || ''}
              onChange={(e) => setHistory({...history, previousSurgeries: e.target.value.split(',').map(s => s.trim())})}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Appendectomy"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Update History
          </button>
        </form>
      </div>

      {/* Upload Medical Records */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Medical Records</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Blood Test Report"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File (PDF or Image)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {/* Uploaded Records */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Medical Records</h2>
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map(record => (
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
          <p className="text-gray-500">No medical records uploaded yet</p>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
