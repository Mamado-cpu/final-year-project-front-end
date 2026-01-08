import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import api from '@/lib/api';
import MapView from '@/components/ui/map-view';

const POLL_MS = 4000;

const LiveTracking = () => {
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const fetch = async () => {
    try {
      const res = await api.get('/locations/admin/collectors');
      const data = res.data || [];
      const arr = data.map((c: any) => ({
        collectorId: c.collectorId || c._id || c.id,
        vehicleNumber: c.vehicleNumber,
        vehicleType: c.vehicleType,
        currentLat: c.lastKnownLocation?.latitude || c.realtimeLocation?.latitude,
        currentLng: c.lastKnownLocation?.longitude || c.realtimeLocation?.longitude,
        lastLocationUpdate: c.lastKnownLocation?.timestamp || c.realtimeLocation?.timestamp,
        isAvailable: c.isAvailable
      }));
      setCollectors(arr.filter(c => c.currentLat && c.currentLng));
    } catch (err) {
      setCollectors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('auth_token');

    try {
      const streamUrl = `${api.defaults.baseURL}/locations/stream${token ? `?token=${token}` : ''}`;
      const es = new EventSource(streamUrl);
      esRef.current = es;
      es.onmessage = (evt) => {
        if (!mounted) return;
        try {
          const data = JSON.parse(evt.data || '{}');
          // data is an object mapping collectorId -> location
          const arr = Object.entries(data || {}).map(([collectorId, v]: any) => ({
            collectorId,
            vehicleNumber: v.collectorInfo?.vehicleNumber,
            vehicleType: v.collectorInfo?.vehicleType,
            currentLat: v.latitude,
            currentLng: v.longitude,
            lastLocationUpdate: v.timestamp,
            isAvailable: v.isOnline ?? v.collectorInfo?.isAvailable ?? true
          }));
          setCollectors(arr.filter(c => c.currentLat && c.currentLng));
          setLoading(false);
        } catch (err) {
          // ignore
        }
      };
      es.onerror = () => {
        if (esRef.current) { esRef.current.close(); esRef.current = null; }
        fetch();
        pollRef.current = window.setInterval(fetch, POLL_MS) as unknown as number;
      };
    } catch (err) {
      fetch();
      pollRef.current = window.setInterval(fetch, POLL_MS) as unknown as number;
    }

    // Listen for collector updates (e.g., vehicle number change)
    const collectorHandler = () => fetch();
    window.addEventListener('collector:updated', collectorHandler);

    return () => { mounted = false; if (pollRef.current) window.clearInterval(pollRef.current); if (esRef.current) try { esRef.current.close(); } catch (e) {} ; window.removeEventListener('collector:updated', collectorHandler); };
  }, []);

  if (loading) return <Card className="p-6"><p className="text-center">Loading...</p></Card>;

  const markers = collectors.map(c => ({ id: c.collectorId, position: [c.currentLat, c.currentLng] as [number, number], title: c.vehicleNumber, description: `Updated: ${c.lastLocationUpdate ? new Date(c.lastLocationUpdate).toLocaleTimeString() : 'N/A'}` }));

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Live Truck Tracking</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Real-time location of all collection trucks
        </p>
        
        {collectors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No active trucks</p>
        ) : (
          <div className="space-y-3">
            {collectors.map((collector) => (
              <div 
                key={collector.collectorId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{collector.vehicleNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {collector.vehicleType || 'Truck'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Location: {collector.currentLat?.toFixed(4)}, {collector.currentLng?.toFixed(4)}
                    </p>
                    {collector.lastLocationUpdate && (
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(collector.lastLocationUpdate).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  collector.isAvailable 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {collector.isAvailable ? 'Available' : 'On Job'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Map View</h3>
        <MapView center={markers[0] ? markers[0].position : [13.4549, -16.579]} zoom={11} markers={markers.map(m => ({ position: m.position, title: m.title, description: m.description }))} />
      </Card>
    </div>
  );
};

export default LiveTracking;
