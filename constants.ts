
import { LandRecord, Complaint, User } from './types';

export const APP_THEME = {
  primary: '#1e3a8a', // Dark Blue
  secondary: '#10b981', // Green
  danger: '#ef4444', // Red
  warning: '#f59e0b', // Yellow
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Rajesh Kumar', role: 'ADMIN', email: 'admin@drda.gov.in', avatar: 'https://picsum.photos/seed/admin/100' },
  { id: 'u2', name: 'Officer Amit Singh', role: 'FIELD_OFFICER', email: 'amit@drda.gov.in', avatar: 'https://picsum.photos/seed/officer/100' },
  { id: 'u3', name: 'John Doe', role: 'CITIZEN', email: 'john@gmail.com', avatar: 'https://picsum.photos/seed/citizen/100' },
];

export const MOCK_LANDS: LandRecord[] = [
  // Requested Seed Data
  {
    id: 'seed-1',
    surveyNumber: 'TEST123',
    district: 'Chennai',
    taluk: 'Tambaram',
    village: 'Tambaram',
    area: 5.5,
    status: 'GOVERNMENT',
    boundaries: [[12.920, 80.110], [12.922, 80.110], [12.922, 80.113], [12.920, 80.113]],
    // Added missing geoBoundary property
    geoBoundary: { type: 'Polygon', coordinates: [[[12.920, 80.110], [12.922, 80.110], [12.922, 80.113], [12.920, 80.113]]] },
    documents: [],
    registeredAt: '2024-05-20'
  },
  {
    id: 'seed-2',
    surveyNumber: 'ENC001',
    district: 'Chennai',
    taluk: 'Tambaram',
    village: 'Selaiyur',
    area: 2.1,
    status: 'ENCROACHED',
    boundaries: [[12.925, 80.115], [12.927, 80.115], [12.927, 80.118], [12.925, 80.118]],
    // Added missing geoBoundary property
    geoBoundary: { type: 'Polygon', coordinates: [[[12.925, 80.115], [12.927, 80.115], [12.927, 80.118], [12.925, 80.118]]] },
    documents: [],
    registeredAt: '2024-05-21'
  },
  {
    id: 'seed-3',
    surveyNumber: 'DIS001',
    district: 'Chennai',
    taluk: 'Tambaram',
    village: 'Chromepet',
    area: 3.8,
    status: 'DISPUTE',
    boundaries: [[12.915, 80.105], [12.917, 80.105], [12.917, 80.108], [12.915, 80.108]],
    // Added missing geoBoundary property
    geoBoundary: { type: 'Polygon', coordinates: [[[12.915, 80.105], [12.917, 80.105], [12.917, 80.108], [12.915, 80.108]]] },
    documents: [],
    registeredAt: '2024-05-22'
  },
  // Existing Data
  {
    id: 'l1',
    surveyNumber: 'SN-402',
    district: 'Kanchipuram',
    taluk: 'Tambaram',
    village: 'Mudichur',
    area: 12.5,
    status: 'GOVERNMENT',
    boundaries: [[12.923, 80.103], [12.925, 80.103], [12.925, 80.106], [12.923, 80.106]],
    // Added missing geoBoundary property
    geoBoundary: { type: 'Polygon', coordinates: [[[12.923, 80.103], [12.925, 80.103], [12.925, 80.106], [12.923, 80.106]]] },
    documents: [],
    registeredAt: '2023-01-15'
  },
  {
    id: 'l2',
    surveyNumber: 'SN-511',
    district: 'Kanchipuram',
    taluk: 'Tambaram',
    village: 'Perungalathur',
    area: 4.2,
    status: 'ENCROACHED',
    boundaries: [[12.905, 80.095], [12.908, 80.095], [12.908, 80.098], [12.905, 80.098]],
    // Added missing geoBoundary property
    geoBoundary: { type: 'Polygon', coordinates: [[[12.905, 80.095], [12.908, 80.095], [12.908, 80.098], [12.905, 80.098]]] },
    documents: [],
    registeredAt: '2023-03-22'
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'C-001',
    title: 'Unauthorized construction near lake',
    priority: 'HIGH',
    citizenId: 'u3',
    description: 'Unauthorized construction observed near the lake boundary.',
    location: [12.906, 80.096],
    latitude: 12.906,
    longitude: 80.096,
    photos: ['https://picsum.photos/seed/enc1/400/300'],
    status: 'PENDING',
    createdAt: '2024-05-15T10:30:00Z',
    aiVerification: 'High probability of encroachment detected via structural patterns.'
  },
  {
    id: 'C-002',
    title: 'Illegal fencing on pasture land',
    priority: 'NORMAL',
    citizenId: 'u3',
    description: 'Fencing being erected on government pasture land.',
    location: [12.891, 80.081],
    latitude: 12.891,
    longitude: 80.081,
    photos: ['https://picsum.photos/seed/enc2/400/300'],
    status: 'VERIFIED',
    assignedOfficerId: 'u2',
    createdAt: '2024-05-16T14:20:00Z'
  }
];
