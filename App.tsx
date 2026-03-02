
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapPortal from './components/MapPortal';
import LandRegistry from './components/LandRegistry';
import CitizenComplaints from './components/CitizenComplaints';
import AdminComplaints from './components/AdminComplaints';
import { MOCK_USERS } from './constants';
import { User, LandRecord, Complaint, UserRole, ComplaintStatus } from './types';
import { Shield, Lock, MapPin, Search, AlertCircle, Loader2 } from 'lucide-react';
import { fetchComplaintsApi, updateComplaintStatusApi } from './services/complaintService';
import { fetchAllLandsApi } from './services/landService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [lands, setLands] = useState<LandRecord[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showLogin, setShowLogin] = useState(true);
  const [loginRole, setLoginRole] = useState<UserRole>('ADMIN');
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [allComplaints, allLands] = await Promise.all([
        fetchComplaintsApi(),
        fetchAllLandsApi()
      ]);
      setComplaints(allComplaints);
      setLands(allLands);
      console.log("[APP] Global state synced with DB.");
    } catch (error) {
      console.error("Data refresh failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogin = () => {
    const selectedUser = MOCK_USERS.find(u => u.role === loginRole) || MOCK_USERS[0];
    setUser(selectedUser);
    setShowLogin(false);
    setActiveView(loginRole === 'CITIZEN' ? 'map' : 'dashboard');
  };

  const handleUpdateComplaintStatus = async (id: string, status: ComplaintStatus) => {
    await updateComplaintStatusApi(id, status);
    await refreshData();
    console.log(`[APP] Complaint ${id} updated to ${status}. UI refreshed.`);
  };

  const citizenComplaints = complaints.filter(c => c.citizenId === user?.id);
  const officerComplaints = complaints.filter(c => 
    c.status !== 'PENDING' && (user?.role === 'ADMIN' || c.assignedOfficerId === user?.id || !c.assignedOfficerId)
  );

  if (showLogin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800/20">
          <div className="p-8 bg-slate-900 text-white flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight text-white">DRDA PORTAL</h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">Government of India</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Access Level Verification</label>
              <div className="grid grid-cols-1 gap-2">
                {(['ADMIN', 'FIELD_OFFICER', 'CITIZEN'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => setLoginRole(role)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                      loginRole === role 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-sm font-bold capitalize">{role.toLowerCase().replace('_', ' ')}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${loginRole === role ? 'border-blue-600 bg-blue-600' : 'border-slate-200'}`}>
                       {loginRole === role && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleLogin}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
            >
              <Lock size={18} />
              <span>Login Authorized Access</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight">Authorized Personnel Only • GPS Tracking Enabled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        role={user?.role || 'CITIZEN'} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={() => setShowLogin(true)}
        userName={user?.name || ''}
      />
      
      <main className="flex-1 overflow-y-auto relative p-8">
        <div className="max-w-7xl mx-auto h-full">
          {activeView === 'dashboard' && <Dashboard lands={lands} complaints={complaints} />}
          
          {activeView === 'map' && (
            <div className="h-[calc(100vh-160px)] flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">GIS Intelligence</h2>
                  <p className="text-slate-500 font-medium">Real-time geospatial monitoring and case filing.</p>
                </div>
                <div className="flex items-center space-x-3">
                  {loading && <Loader2 size={18} className="text-blue-600 animate-spin" />}
                  <span className="text-[10px] px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-black uppercase tracking-widest border border-emerald-200 shadow-sm">Live System Status</span>
                </div>
              </div>
              <MapPortal lands={lands} complaints={complaints} onComplaintSubmitted={refreshData} />
            </div>
          )}

          {activeView === 'register' && <LandRegistry onSuccess={refreshData} />}

          {activeView === 'complaints' && (
            user?.role === 'CITIZEN' 
              ? <CitizenComplaints complaints={citizenComplaints} onFileNew={() => setActiveView('map')} />
              : <AdminComplaints 
                  complaints={complaints} 
                  onUpdateStatus={handleUpdateComplaintStatus} 
                  isOfficer={user?.role === 'FIELD_OFFICER'}
                />
          )}

          {activeView === 'inspections' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <div className="flex justify-between items-center">
                 <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Field Worklist</h2>
                   <p className="text-slate-500 font-medium">Verified inspections and status updates.</p>
                 </div>
               </div>
               <AdminComplaints 
                 complaints={officerComplaints} 
                 onUpdateStatus={handleUpdateComplaintStatus} 
                 isOfficer={true}
               />
            </div>
          )}

          {activeView === 'legal' && (
            <div className="bg-white rounded-[40px] p-20 border border-slate-200 text-center space-y-6 shadow-sm">
               <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm transform rotate-3 hover:rotate-0 transition-transform">
                  <Shield size={48} />
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Legal Tracking Terminal</h2>
               <p className="text-slate-500 max-w-lg mx-auto font-medium leading-relaxed text-lg">
                 Autonomous tracking of eviction notices, court hearings, and final resolution reports.
               </p>
               <div className="pt-6 flex justify-center space-x-4">
                 <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-blue-600 transition-all">Active Legal Cases</button>
                 <button className="px-10 py-4 border border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all text-slate-600">Archived Records</button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
