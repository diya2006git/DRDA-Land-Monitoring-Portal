
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Filter, Loader2, MapPin, Info, ArrowRight, AlertCircle, Plus, X, Camera, Send, CheckCircle } from 'lucide-react';
import { LandRecord, Complaint, LandStatus, ComplaintPriority } from '../types';
import { searchLandsApi, getSearchSuggestions } from '../services/landService';
import { submitComplaintApi } from '../services/complaintService';

// Custom marker icon for complaints
const complaintIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
});

// Icon for pin dropping
const dropPinIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1160/1160358.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Helper for Point-in-Polygon
const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
  let x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0], yi = polygon[i][1];
    let xj = polygon[j][0], yj = polygon[j][1];
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const getStatusColor = (status: LandStatus) => {
  switch (status) {
    case 'GOVERNMENT': return '#10b981';
    case 'DISPUTE': return '#f59e0b';
    case 'ENCROACHED': return '#ef4444';
    default: return '#94a3b8';
  }
};

interface MapPortalProps {
  lands: LandRecord[];
  complaints: Complaint[];
  onComplaintSubmitted?: () => void;
}

const MapController = ({ targetLand }: { targetLand: LandRecord | null }) => {
  const map = useMap();
  useEffect(() => {
    if (targetLand && targetLand.boundaries.length > 0) {
      const bounds = L.latLngBounds(targetLand.boundaries as L.LatLngExpression[]);
      map.flyToBounds(bounds, { padding: [150, 150], duration: 1.2 });
    }
  }, [targetLand, map]);
  return null;
};

const MapPortal: React.FC<MapPortalProps> = ({ lands: initialLands, complaints, onComplaintSubmitted }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchResults, setSearchResults] = useState<LandRecord[]>(initialLands);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLand, setSelectedLand] = useState<LandRecord | null>(null);
  const [showNoResult, setShowNoResult] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [droppedPin, setDroppedPin] = useState<[number, number] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', photo: null as File | null });
  const [successId, setSuccessId] = useState<string | null>(null);
  const [detectedPriority, setDetectedPriority] = useState<ComplaintPriority>('NORMAL');
  const [detectedSurvey, setDetectedSurvey] = useState<string>('N/A');

  const performSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResults(initialLands);
      setSelectedLand(null);
      setShowNoResult(false);
      return;
    }
    setIsSearching(true);
    setShowNoResult(false);
    setShowSuggestions(false);
    try {
      const results = await searchLandsApi(trimmed, statusFilter);
      setSearchResults(results);
      if (results.length > 0) setSelectedLand(results[0]);
      else {
        setShowNoResult(true);
        setSelectedLand(null);
        const sug = await getSearchSuggestions(trimmed);
        setSuggestions(sug);
      }
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [statusFilter, initialLands]);

  const handleMapClick = (latlng: L.LatLng) => {
    if (isReporting) {
      const point: [number, number] = [latlng.lat, latlng.lng];
      setDroppedPin(point);
      
      // Auto-detect survey and priority
      const matchedLand = initialLands.find(l => isPointInPolygon(point, l.boundaries));
      if (matchedLand) {
        setDetectedPriority('HIGH');
        setDetectedSurvey(matchedLand.surveyNumber);
      } else {
        setDetectedPriority('NORMAL');
        setDetectedSurvey('N/A');
      }

      setShowModal(true);
      setIsReporting(false);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        handleMapClick(e.latlng);
        setShowSuggestions(false);
      },
    });
    return null;
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!droppedPin) return;
    setSubmitting(true);
    
    try {
      const resp = await submitComplaintApi({
        title: formData.title,
        description: formData.description,
        latitude: droppedPin[0],
        longitude: droppedPin[1],
        surveyNumber: detectedSurvey,
        priority: detectedPriority,
        photos: formData.photo ? [URL.createObjectURL(formData.photo)] : []
      });
      setSuccessId(resp.id);
      if (onComplaintSubmitted) onComplaintSubmitted();
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetReporting = () => {
    setIsReporting(false);
    setDroppedPin(null);
    setShowModal(false);
    setSuccessId(null);
    setFormData({ title: '', description: '', photo: null });
  };

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={searchRef} className="absolute top-4 left-4 z-[1000] flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-[calc(100%-2rem)] sm:w-auto max-w-xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            {isSearching ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Search size={18} />}
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl shadow-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all font-semibold"
            placeholder="Search Survey No / Village / District..."
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') performSearch(searchQuery);
            }}
          />
        </div>
        
        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-slate-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="GOVERNMENT">Government Lands</option>
          <option value="DISPUTE">Disputes</option>
          <option value="ENCROACHED">Encroached</option>
        </select>
      </div>

      {!isReporting && !showModal && (
        <button
          onClick={() => setIsReporting(true)}
          className="absolute bottom-10 right-10 z-[1000] bg-emerald-600 text-white flex items-center space-x-3 px-6 py-4 rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all font-bold group"
        >
          <Plus size={20} />
          <span>Report Issue</span>
        </button>
      )}

      {isReporting && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20 animate-bounce">
          <MapPin size={20} className="text-emerald-400" />
          <span className="text-sm font-bold">Click map to drop a location pin</span>
          <button onClick={() => setIsReporting(false)} className="ml-2 hover:text-red-400"><X size={18} /></button>
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 z-[2000] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {successId ? (
              <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-bold">Case Logged</h2>
                <p className="text-slate-500 text-sm">Case ID: <span className="font-bold text-blue-600">{successId}</span></p>
                <button onClick={resetReporting} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg">Back to Portal</button>
              </div>
            ) : (
              <form onSubmit={submitForm}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-800">Encroachment Filing</h2>
                  <button type="button" onClick={resetReporting} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className={`p-4 rounded-2xl flex items-center justify-between border ${detectedPriority === 'HIGH' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}>
                     <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${detectedPriority === 'HIGH' ? 'bg-red-600' : 'bg-emerald-600'} text-white`}><MapPin size={20} /></div>
                        <div className="text-xs">
                           <p className="font-black uppercase tracking-tighter">{detectedPriority === 'HIGH' ? 'Government Land Detected' : 'General Location'}</p>
                           <p className="font-mono">Survey: {detectedSurvey}</p>
                        </div>
                     </div>
                     <span className={`text-[10px] font-black px-2 py-1 rounded-full ${detectedPriority === 'HIGH' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                       {detectedPriority} PRIORITY
                     </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Incident Title</label>
                    <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Wall construction on govt land" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Situation Details</label>
                    <textarea required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" placeholder="Provide description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Proof Photo</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <Camera size={24} className="mb-2 text-slate-400" />
                      <p className="text-xs text-slate-400">{formData.photo ? formData.photo.name : 'Upload scene photo'}</p>
                      <input type="file" className="hidden" accept="image/*" onChange={e => setFormData({...formData, photo: e.target.files?.[0] || null})} />
                    </label>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 flex space-x-3">
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 flex items-center justify-center space-x-2">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /><span>Lodge Complaint</span></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <MapContainer center={[12.923, 80.110]} zoom={14} scrollWheelZoom={true} className="z-10">
        <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController targetLand={selectedLand} />
        {searchResults.map((land) => (
          <Polygon
            key={land.id}
            positions={land.boundaries as L.LatLngExpression[]}
            pathOptions={{
              fillColor: getStatusColor(land.status),
              fillOpacity: selectedLand?.id === land.id ? 0.75 : 0.45,
              color: selectedLand?.id === land.id ? '#3b82f6' : getStatusColor(land.status),
              weight: selectedLand?.id === land.id ? 5 : 2.5,
            }}
            eventHandlers={{ click: () => setSelectedLand(land) }}
          />
        ))}
        {complaints.map((comp) => (
          <Marker key={comp.id} position={[comp.latitude, comp.longitude]} icon={complaintIcon}>
            <Popup>
              <div className="p-1 min-w-[180px]">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle size={14} className={comp.priority === 'HIGH' ? 'text-red-500' : 'text-blue-500'} />
                  <p className="font-bold text-xs uppercase">{comp.id}</p>
                </div>
                <p className="text-[11px] font-bold text-slate-900 leading-tight mb-2">{comp.title}</p>
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                   <span className="text-[8px] font-black uppercase text-slate-400">{comp.status}</span>
                   <span className="text-[8px] font-bold text-blue-600">{new Date(comp.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {droppedPin && !showModal && <Marker position={droppedPin} icon={dropPinIcon} />}
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default MapPortal;
