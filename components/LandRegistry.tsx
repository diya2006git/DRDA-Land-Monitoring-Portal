
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Upload, 
  MapPin, 
  Save, 
  X, 
  Plus, 
  Search, 
  FileText, 
  ChevronRight,
  Loader2,
  CheckCircle,
  Map as MapIcon,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { LandRecord, LandStatus, GeoBoundary } from '../types';
import { fetchAllLandsApi, createLandApi } from '../services/landService';

// --- GIS Map Fix Component ---
function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 700); // wait until modal animation completes
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// --- Drawing Controller Component ---
interface DrawingControlProps {
  onPolygonCreated: (coords: [number, number][]) => void;
}

const DrawingControl: React.FC<DrawingControlProps> = ({ onPolygonCreated }) => {
  const map = useMap();
  // Fix: Use any for Draw control reference as it's not in standard Leaflet types
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    map.addLayer(drawnItemsRef.current);

    // Fix: Cast L.Control to any to access Draw property (provided by leaflet-draw plugin)
    const drawControl = new (L.Control as any).Draw({
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: { color: '#e11d48', message: '<strong>Polygon intersections not allowed<strong>' },
          shapeOptions: { color: '#2563eb' }
        },
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: false
      }
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    const onCreated = (e: any) => {
      const layer = e.layer;
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(layer);
      
      const latlngs = layer.getLatLngs()[0];
      const coords: [number, number][] = latlngs.map((ll: L.LatLng) => [ll.lat, ll.lng]);
      onPolygonCreated(coords);
    };

    // Fix: Cast L as any to access Draw namespace (provided by leaflet-draw plugin)
    map.on((L as any).Draw.Event.CREATED, onCreated);

    return () => {
      // Fix: Cast L as any to access Draw namespace (provided by leaflet-draw plugin)
      map.off((L as any).Draw.Event.CREATED, onCreated);
      map.removeControl(drawControl);
      map.removeLayer(drawnItemsRef.current);
    };
  }, [map, onPolygonCreated]);

  return null;
};

// --- Main LandRegistry Component ---
interface LandRegistryProps {
  onSuccess: () => void;
}

const LandRegistry: React.FC<LandRegistryProps> = ({ onSuccess }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [lands, setLands] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Drawing Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<[number, number][]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    surveyNumber: '',
    district: '',
    taluk: '',
    village: '',
    area: '',
    status: 'GOVERNMENT' as LandStatus,
    boundaries: [] as [number, number][],
    geoBoundary: null as GeoBoundary | null
  });

  const loadLands = async () => {
    setLoading(true);
    try {
      const data = await fetchAllLandsApi();
      setLands(data);
    } catch (error) {
      console.error("Failed to load lands", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLands();
  }, []);

  const handleCaptureBoundary = () => {
    if (tempCoords.length < 3) {
      setError("Please complete the polygon drawing (min 3 points).");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      boundaries: tempCoords,
      geoBoundary: {
        type: 'Polygon',
        coordinates: [tempCoords.map(c => [c[1], c[0]])] // GeoJSON format: [lng, lat]
      }
    }));
    
    setIsMapModalOpen(false);
    setTempCoords([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.boundaries.length === 0) {
      setError("Please draw land boundary before saving.");
      return;
    }

    setSubmitting(true);
    try {
      await createLandApi({
        ...formData,
        area: Number(formData.area),
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setView('LIST');
        loadLands();
        onSuccess();
      }, 1500);
      setFormData({
        surveyNumber: '', district: '', taluk: '', village: '', area: '', status: 'GOVERNMENT', boundaries: [], geoBoundary: null
      });
    } catch (error) {
      console.error("Failed to register land", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLands = lands.filter(l => 
    l.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: LandStatus) => {
    switch (status) {
      case 'GOVERNMENT': return 'bg-emerald-100 text-emerald-700';
      case 'DISPUTE': return 'bg-amber-100 text-amber-700';
      case 'ENCROACHED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (view === 'CREATE') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Land Entry Protocol</h2>
            <p className="text-slate-500 text-sm font-medium">Digital survey registration for the DRDA master database.</p>
          </div>
          <button onClick={() => setView('LIST')} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-full shadow-sm">
            <X size={24} />
          </button>
        </div>

        {showSuccess ? (
          <div className="p-20 text-center space-y-4 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} />
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Registration Complete</h3>
             <p className="text-slate-500">The survey record has been committed to the central server.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600">
                <AlertTriangle size={20} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Survey Identification</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.surveyNumber}
                  onChange={e => setFormData({...formData, surveyNumber: e.target.value})}
                  placeholder="e.g. SN-402/1A"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">District Admin Unit</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value})}
                  placeholder="e.g. Chennai"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taluk Division</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.taluk}
                  onChange={e => setFormData({...formData, taluk: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Village Locality</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.village}
                  onChange={e => setFormData({...formData, village: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Area (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership Status</label>
                <select
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as LandStatus})}
                >
                  <option value="GOVERNMENT">Government Property</option>
                  <option value="DISPUTE">Under Dispute</option>
                  <option value="ENCROACHED">Confirmed Encroachment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GIS Mapping (Required)</label>
                {formData.boundaries.length > 0 ? (
                  <div className="relative h-40 bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden group">
                    <MapContainer 
                      center={formData.boundaries[0]} 
                      zoom={16} 
                      zoomControl={false} 
                      dragging={false} 
                      doubleClickZoom={false} 
                      scrollWheelZoom={false}
                      className="h-full w-full opacity-70 grayscale-[0.5]"
                    >
                      <MapResizeFix />
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                      <Polygon positions={formData.boundaries as L.LatLngExpression[]} pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.3 }} />
                    </MapContainer>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold shadow-lg flex items-center space-x-2 text-xs"
                      >
                        <Maximize2 size={14} />
                        <span>Redraw Boundary</span>
                      </button>
                    </div>
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center space-x-1">
                      <CheckCircle size={10} />
                      <span>Captured</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsMapModalOpen(true)}
                    className="h-40 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center text-blue-400 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group"
                  >
                    <MapPin size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest">Draw Boundaries on Map</p>
                    <p className="text-[10px] mt-1 font-medium">Click to open GIS terminal</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Artifacts</label>
                <div className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:bg-slate-100 cursor-pointer transition-all group">
                  <Upload size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold uppercase tracking-widest">Upload FMB / Deeds</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setView('LIST')}
                className="px-8 py-3.5 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center space-x-2"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span>Commit Registry</span>
              </button>
            </div>
          </form>
        )}

        {/* --- FULL SCREEN MAP MODAL --- */}
        {isMapModalOpen && (
          <div className="fixed inset-0 z-[5000] bg-slate-900 flex flex-col animate-in fade-in duration-300">
            <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
               <div>
                 <h2 className="text-xl font-black text-slate-900">GIS Drawing Terminal</h2>
                 <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Define Surveyor Coordinates</p>
               </div>
               <div className="flex items-center space-x-4">
                 <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                   <p className="text-xs font-bold text-slate-800">{tempCoords.length} Points Collected</p>
                 </div>
                 <button 
                   onClick={() => setIsMapModalOpen(false)}
                   className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
                 >
                   <X size={24} />
                 </button>
               </div>
            </div>

            <div className="flex-1 relative" style={{ height: "100vh", width: "100%" }}>
              <MapContainer 
                center={[13.0827, 80.2707]} 
                zoom={13} 
                className="h-full w-full"
              >
                <MapResizeFix />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                <DrawingControl onPolygonCreated={setTempCoords} />
              </MapContainer>
              
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[5001] pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black uppercase tracking-widest">Interactive Plotting Enabled</span>
                </div>
              </div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[5001] w-full max-w-lg px-6">
                <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-4 text-center">Use the drawing toolbar on the top-left to plot the land boundary.</p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setIsMapModalOpen(false)}
                      className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleCaptureBoundary}
                      disabled={tempCoords.length < 3}
                      className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle size={20} />
                      <span>Capture Boundary</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Land Registry</h2>
          <p className="text-slate-500 font-medium">Authoritative database of government-owned real estate.</p>
        </div>
        <button 
          onClick={() => setView('CREATE')}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Register New Land</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by Survey No or Village..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={loadLands} className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
               {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Survey No</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Area</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Registry Date</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <MapIcon className="text-slate-300" size={48} />
                      <p className="text-slate-500 font-bold italic">No land records match the current criteria.</p>
                      <button onClick={() => setView('CREATE')} className="text-blue-600 font-bold text-sm hover:underline">Register first land record</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLands.map((land) => (
                  <tr key={land.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs">
                          {land.surveyNumber.slice(0, 2)}
                        </div>
                        <span className="font-black text-slate-800">{land.surveyNumber}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{land.village}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{land.district}, {land.taluk}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono font-bold text-slate-600 text-sm">{land.area.toFixed(2)} Ac</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm ${getStatusColor(land.status)}`}>
                        {land.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                      {new Date(land.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      <button className="flex items-center space-x-1 text-slate-400 hover:text-blue-600 transition-colors">
                        <FileText size={18} />
                        <span className="text-xs font-bold">Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LandRegistry;
