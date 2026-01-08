import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import MapView from '@/components/ui/map-view';

const POLL_MS = 5000;

const TrackTrucks = () => {
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations/collectors');
      const data = res.data || {};
      const arr = Object.entries(data).map(([collectorId, v]: any) => ({
        collectorId,
        currentLat: v.latitude,
        currentLng: v.longitude,
        lastLocationUpdate: v.timestamp,
        vehicleNumber: v.collectorInfo?.vehicleNumber || `Collector ${collectorId}`,
        isAvailable: v.collectorInfo?.isAvailable ?? true
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

    // Try SSE stream first (pass token as query param - backend accepts query token)
    try {
      const streamUrl = `${api.defaults.baseURL}/locations/stream${token ? `?token=${token}` : ''}`;
      const es = new EventSource(streamUrl);
      esRef.current = es;
      es.onmessage = (evt) => {
        if (!mounted) return;
        try {
          const data = JSON.parse(evt.data || '{}');
          // data is an object of collectorId -> location
          const arr = Object.entries(data || {}).map(([collectorId, v]: any) => ({
            collectorId,
            currentLat: v.latitude,
            currentLng: v.longitude,
            lastLocationUpdate: v.timestamp,
            vehicleNumber: v.collectorInfo?.vehicleNumber || `Collector ${collectorId}`,
            isAvailable: v.collectorInfo?.isAvailable ?? true
          }));
          setCollectors(arr.filter(c => c.currentLat && c.currentLng));
          setLoading(false);
        } catch (err) {
          // ignore parse errors
        }
      };
      es.onerror = () => {
        // fallback to polling on error
        if (esRef.current) {
          esRef.current.close();
          esRef.current = null;
        }
        fetchLocations();
        pollRef.current = window.setInterval(fetchLocations, POLL_MS) as unknown as number;
      };
    } catch (err) {
      fetchLocations();
      pollRef.current = window.setInterval(fetchLocations, POLL_MS) as unknown as number;
    }

    return () => {
      mounted = false;
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (esRef.current) {
        try { esRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  if (loading) return <Card className="p-6"><p className="text-center">Loading...</p></Card>;

  const markers = collectors.map(c => ({ id: c.collectorId, position: [c.currentLat, c.currentLng] as [number, number], title: c.vehicleNumber, description: `Updated: ${c.lastLocationUpdate ? new Date(c.lastLocationUpdate).toLocaleTimeString() : 'N/A'}` }));

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Track Collection Trucks</h2>

        {collectors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No active trucks</p>
        ) : (
          <div className="space-y-3">
            {collectors.map((collector) => (
              <div key={collector.collectorId} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{collector.vehicleNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Location: {collector.currentLat?.toFixed(4)}, {collector.currentLng?.toFixed(4)}
                    </p>
                    {collector.lastLocationUpdate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(collector.lastLocationUpdate).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <Badge className={collector.isAvailable ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}>
                    {collector.isAvailable ? 'Available' : 'On Job'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Map View</h3>
        <MapView center={markers[0] ? markers[0].position : [13.4549, -16.579]} zoom={12} markers={markers.map(m => ({ position: m.position, title: m.title, description: m.description }))} />
      </Card>
    </div>
  );
};

export default TrackTrucks;
