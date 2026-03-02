
import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  FilePlus, 
  AlertCircle, 
  ShieldCheck, 
  Gavel, 
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeView, setActiveView, onLogout, userName }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'FIELD_OFFICER'] },
    { id: 'map', label: 'GIS Map', icon: MapIcon, roles: ['ADMIN', 'FIELD_OFFICER', 'CITIZEN'] },
    { id: 'register', label: 'Land Registry', icon: FilePlus, roles: ['ADMIN'] },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle, roles: ['ADMIN', 'FIELD_OFFICER', 'CITIZEN'] },
    { id: 'inspections', label: 'My Inspections', icon: ShieldCheck, roles: ['FIELD_OFFICER'] },
    { id: 'legal', label: 'Legal Tracking', icon: Gavel, roles: ['ADMIN'] },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300">
      <div className="p-6 flex items-center space-x-3 bg-slate-950">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">DR</div>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">DRDA PORTAL</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Government of India</p>
        </div>
      </div>

      <div className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.filter(item => item.roles.includes(role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <UserIcon size={16} />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white">{userName}</p>
            <p className="text-[10px] text-slate-500 capitalize">{role.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
