import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Navigation } from 'lucide-react';
import api from '@/lib/api';
import MapView from '@/components/ui/map-view';

const LocationSharing = ({ collectorId }: { collectorId: string | null }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ lat: number; lng: number; ts: string } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number; ts: string } | null>(null);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
      }
      if (intervalRef.current !== null) {
        try { window.clearInterval(intervalRef.current); } catch (e) {}
        intervalRef.current = null;
      }
    };
  }, []);

  const startSharing = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    // Try to obtain a current position and then keep a watch; send last known coordinates every 10s
    // Clear any previous interval
    if (intervalRef.current !== null) {
      try { window.clearInterval(intervalRef.current); } catch (e) {}
      intervalRef.current = null;
    }

    // Try to get an initial position (longer timeout). If it times out we'll rely on watchPosition.
    navigator.geolocation.getCurrentPosition((position) => {
      const p = { lat: position.coords.latitude, lng: position.coords.longitude, ts: new Date().toISOString() };
      lastPosRef.current = p;
      setPreview(p);
      (async () => {
        try {
          if (collectorId) {
            await api.post('/locations/update', {
              latitude: p.lat,
              longitude: p.lng,
              timestamp: p.ts,
              isOnline: true
            });
          }
        } catch (err: any) {
          console.error('Failed to send initial location', err);
        }
      })();
    }, (err) => {
      console.warn('getCurrentPosition error', err);
      if (err && err.code === 1) {
        toast.error('Location permission denied');
      } else if (err && err.code === 3) {
        toast.info('Waiting for GPS fix...');
      }
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });

    // Start a watch to update last known position
    try {
      const wId = navigator.geolocation.watchPosition((position) => {
        const p = { lat: position.coords.latitude, lng: position.coords.longitude, ts: new Date().toISOString() };
        lastPosRef.current = p;
        setPreview(p);
      }, (err) => {
        console.warn('watchPosition error', err);
        if (err && err.code === 1) toast.error('Location permission denied');
      }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
      setWatchId(wId as unknown as number);
    } catch (e) {
      console.warn('watchPosition not available', e);
    }

    // Periodically send last known position every 10 seconds
    const iid = window.setInterval(async () => {
      const p = lastPosRef.current;
      if (!p) return;
      try {
        if (collectorId) {
          await api.post('/locations/update', {
            latitude: p.lat,
            longitude: p.lng,
            timestamp: p.ts,
            isOnline: true
          });
        }
      } catch (err: any) {
        console.error('Failed to send location', err);
      }
    }, 10000) as unknown as number;
    intervalRef.current = iid;
    setIsSharing(true);
    toast.success('Location sharing started');
  };

  const stopSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
    if (intervalRef.current !== null) {
      try { window.clearInterval(intervalRef.current); } catch (e) {}
      intervalRef.current = null;
    }
    // Tell backend we're offline
    (async () => {
      try {
        await api.post('/locations/update', { isOnline: false });
      } catch (err) {
        // ignore
      }
    })();
    toast.info('Location sharing stopped');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Location Sharing</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Share your location in real-time so residents and admins can track your truck
      </p>
      
      {!isSharing ? (
        <Button onClick={startSharing} className="w-full">
          <Navigation className="mr-2 h-4 w-4" />
          Start Sharing Location
        </Button>
      ) : (
        <div>
          <div className="flex items-center justify-center p-4 bg-green-500/10 text-green-600 rounded-lg mb-4">
            <MapPin className="mr-2 h-5 w-5 animate-pulse" />
            <span className="font-medium">Sharing Location</span>
          </div>
          {preview && (
            <div className="mb-4">
              <MapView center={[preview.lat, preview.lng]} zoom={16} markers={[{ position: [preview.lat, preview.lng], title: 'You', description: `Updated: ${new Date(preview.ts).toLocaleTimeString()}` }]} />
            </div>
          )}
          <Button variant="destructive" onClick={stopSharing} className="w-full">
            Stop Sharing
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationSharing;
