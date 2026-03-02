
export type UserRole = 'ADMIN' | 'FIELD_OFFICER' | 'CITIZEN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatar?: string;
}

export type LandStatus = 'GOVERNMENT' | 'DISPUTE' | 'ENCROACHED';

export interface GeoBoundary {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface LandRecord {
  id: string;
  surveyNumber: string;
  district: string;
  taluk: string;
  village: string;
  area: number; // in acres
  status: LandStatus;
  geoBoundary: GeoBoundary;
  boundaries: [number, number][]; // Keeping for leaflet compatibility
  documents: string[]; // URLs
  registeredAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ComplaintStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'LEGAL_ACTION' | 'CLOSED';
export type ComplaintPriority = 'HIGH' | 'NORMAL';

export interface Complaint {
  id: string;
  title: string;
  citizenId: string;
  surveyNumber?: string;
  description: string;
  location: [number, number];
  latitude: number;
  longitude: number;
  photos: string[];
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedOfficerId?: string;
  createdAt: string;
  updatedAt?: string;
  inspectionDate?: string;
  aiVerification?: string;
}

export interface LegalCase {
  id: string;
  landId: string;
  complaintId?: string;
  caseNumber: string;
  noticeIssuedAt?: string;
  courtStatus: string;
  nextHearingDate?: string;
  evictionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}
