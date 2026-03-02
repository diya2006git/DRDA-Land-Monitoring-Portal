
import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  X, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Save,
  Loader2
} from 'lucide-react';

interface AdminComplaintsProps {
  complaints: Complaint[];
  onUpdateStatus: (id: string, status: ComplaintStatus) => void;
  isOfficer?: boolean;
}

const AdminComplaints: React.FC<AdminComplaintsProps> = ({ complaints, onUpdateStatus, isOfficer }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempStatus, setTempStatus] = useState<ComplaintStatus | null>(null);

  const getStatusStyle = (status: ComplaintStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-700';
      case 'VERIFIED': return 'bg-emerald-100 text-emerald-700';
      case 'LEGAL_ACTION': return 'bg-purple-100 text-purple-700';
      case 'CLOSED': return 'bg-slate-100 text-slate-700';
    }
  };

  // Helper to format date as DD MMM YYYY, HH:mm
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const handleSaveStatus = async () => {
    if (!selectedComplaint || !tempStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedComplaint.id, tempStatus);
      const now = new Date().toISOString();
      setSelectedComplaint({ 
        ...selectedComplaint, 
        status: tempStatus, 
        inspectionDate: now,
        updatedAt: now 
      });
      setTempStatus(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{isOfficer ? 'Inspection Worklist' : 'Master Complaints Repository'}</h2>
          <p className="text-sm text-slate-500">
            {isOfficer ? 'Review and update status for assigned inspections.' : 'Manage citizen reports and trigger field inspections.'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Complaint Title</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No complaints found.</td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{c.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{c.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded ${c.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border-none shadow-sm ${getStatusStyle(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500 font-medium">
                      <div className="flex flex-col">
                        <span>{formatDate(c.inspectionDate || c.createdAt)}</span>
                        <span className="text-[9px] text-slate-300 uppercase tracking-tighter">
                          {c.inspectionDate ? 'Verified' : 'Filed'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedComplaint(c)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto animate-in zoom-in-95">
            {/* Left side: Content */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">ID: {selectedComplaint.id}</span>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedComplaint.title}</h3>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-red-500">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-3 border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><MapPin size={20} className="text-blue-600" /></div>
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Coordinates</p>
                    <p className="text-slate-900 font-mono font-bold">{selectedComplaint.latitude.toFixed(6)}, {selectedComplaint.longitude.toFixed(6)}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-3 border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Calendar size={20} className="text-blue-600" /></div>
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Filed Date</p>
                    <p className="text-slate-900 font-bold">{formatDate(selectedComplaint.createdAt)}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-3 border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><CheckCircle size={20} className="text-emerald-600" /></div>
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Last Verified</p>
                    <p className="text-slate-900 font-bold">{selectedComplaint.inspectionDate ? formatDate(selectedComplaint.inspectionDate) : 'Pending'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  "{selectedComplaint.description}"
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Detection</label>
                  <div className={`p-3 rounded-xl border flex items-center space-x-2 ${selectedComplaint.priority === 'HIGH' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    <ShieldAlert size={18} />
                    <span className="font-bold">{selectedComplaint.priority} PRIORITY</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Action Status</label>
                  <div className="flex space-x-2">
                    <select 
                      defaultValue={selectedComplaint.status}
                      onChange={(e) => setTempStatus(e.target.value as ComplaintStatus)}
                      className={`flex-1 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${getStatusStyle(tempStatus || selectedComplaint.status)}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="LEGAL_ACTION">Legal Action Started</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <button 
                      onClick={handleSaveStatus}
                      disabled={!tempStatus || isUpdating}
                      className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-lg"
                    >
                      {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      <span className="hidden sm:inline">Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Image Preview */}
            <div className="w-full md:w-80 bg-slate-100 flex items-center justify-center p-4 border-l border-slate-200">
              {selectedComplaint.photos && selectedComplaint.photos.length > 0 ? (
                <div className="relative group w-full h-full flex flex-col">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 text-center">Site Evidence</p>
                  <img 
                    src={selectedComplaint.photos[0]} 
                    alt="Evidence" 
                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                  />
                  <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">Evidence #1</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Eye size={32} />
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No Image Evidence</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
