
import { Complaint, ComplaintStatus } from '../types';
import { MOCK_COMPLAINTS } from '../constants';

const STORAGE_KEY = 'drda_complaints_v2';

// Simulated DB Initialization
const getDb = (): Complaint[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const now = new Date().toISOString();
    const initial = MOCK_COMPLAINTS.map(c => ({
      ...c,
      title: c.id === 'C-001' ? 'Unauthorized building' : 'Illegal Fencing',
      priority: 'NORMAL' as const,
      latitude: c.location[0],
      longitude: c.location[1],
      status: 'PENDING' as const,
      createdAt: c.createdAt || now,
      updatedAt: now,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

export const fetchComplaintsApi = async (userId?: string): Promise<Complaint[]> => {
  console.log('[BACKEND] GET /api/complaints');
  await new Promise(resolve => setTimeout(resolve, 300));
  let db = getDb();
  if (userId) db = db.filter(c => c.citizenId === userId);
  return db;
};

export const submitComplaintApi = async (data: Partial<Complaint>): Promise<Complaint> => {
  console.log('[BACKEND] POST /api/complaints', data);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date().toISOString();
  const db = getDb();
  const newComplaint: Complaint = {
    id: `CMP-${Math.floor(Math.random() * 90000) + 10000}`,
    title: data.title || 'Land Issue Report',
    citizenId: data.citizenId || 'anonymous',
    surveyNumber: data.surveyNumber || 'N/A',
    description: data.description || '',
    latitude: data.latitude!,
    longitude: data.longitude!,
    location: [data.latitude!, data.longitude!],
    photos: data.photos || [],
    status: 'PENDING',
    priority: data.priority || 'NORMAL',
    createdAt: now,
    updatedAt: now,
    aiVerification: data.aiVerification
  };

  db.push(newComplaint);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return newComplaint;
};

export const updateComplaintStatusApi = async (id: string, status: ComplaintStatus): Promise<void> => {
  console.log(`[BACKEND] PATCH /api/complaints/${id} - Status: ${status}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const db = getDb();
  const index = db.findIndex(c => c.id === id);
  if (index !== -1) {
    const now = new Date().toISOString();
    db[index].status = status;
    db[index].updatedAt = now;
    
    // Set inspection date when status changes from Pending
    if (status !== 'PENDING') {
      db[index].inspectionDate = now;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
};
