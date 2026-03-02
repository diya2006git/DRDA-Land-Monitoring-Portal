
import React from 'react';
import { Complaint } from '../types';
import { Clock, CheckCircle, AlertTriangle, MapPin, Eye } from 'lucide-react';

interface CitizenComplaintsProps {
  complaints: Complaint[];
  onFileNew: () => void;
}

const CitizenComplaints: React.FC<CitizenComplaintsProps> = ({ complaints, onFileNew }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} className="text-yellow-500" />;
      case 'VERIFIED': return <CheckCircle size={16} className="text-emerald-500" />;
      default: return <AlertTriangle size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Reports</h2>
          <p className="text-slate-500 text-sm">Track the status of your reported land issues.</p>
        </div>
        <button 
          onClick={onFileNew}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition-all active:scale-95"
        >
          File New Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {complaints.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No complaints filed yet.</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${c.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{c.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs font-mono text-slate-400">{c.id}</span>
                      <span className="text-slate-200">•</span>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <MapPin size={12} />
                        <span>SN: {c.surveyNumber}</span>
                      </div>
                      <span className="text-slate-200">•</span>
                      <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    {getStatusIcon(c.status)}
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{c.status.replace('_', ' ')}</span>
                  </div>
                  <button className="p-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CitizenComplaints;
