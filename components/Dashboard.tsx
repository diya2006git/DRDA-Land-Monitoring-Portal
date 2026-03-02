
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { TrendingUp, Users, Map as MapIcon, AlertTriangle, FileText } from 'lucide-react';
import { LandRecord, Complaint } from '../types';

interface DashboardProps {
  lands: LandRecord[];
  complaints: Complaint[];
}

const Dashboard: React.FC<DashboardProps> = ({ lands, complaints }) => {
  const stats = [
    { label: 'Total Lands', value: lands.length, icon: MapIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Encroachments', value: lands.filter(l => l.status === 'ENCROACHED').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Pending Complaints', value: complaints.filter(c => c.status === 'PENDING').length, icon: Users, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Total Area (Acres)', value: lands.reduce((acc, l) => acc + l.area, 0).toFixed(1), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const pieData = [
    { name: 'Government', value: lands.filter(l => l.status === 'GOVERNMENT').length, color: '#10b981' },
    { name: 'Dispute', value: lands.filter(l => l.status === 'DISPUTE').length, color: '#f59e0b' },
    { name: 'Encroached', value: lands.filter(l => l.status === 'ENCROACHED').length, color: '#ef4444' },
  ];

  const monthlyData = [
    { month: 'Jan', complaints: 4, verified: 2 },
    { month: 'Feb', complaints: 7, verified: 5 },
    { month: 'Mar', complaints: 5, verified: 3 },
    { month: 'Apr', complaints: 12, verified: 8 },
    { month: 'May', complaints: 8, verified: 4 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">DRDA Command Centre</h2>
        <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
          <FileText size={16} />
          <span>Export PDF Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Land Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Encroachment Reports Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
