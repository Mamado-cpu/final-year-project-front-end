import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

import TaskList from '@/components/collector/TaskList';
import LocationSharing from '@/components/collector/LocationSharing';
import { LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

const CollectorDashboard = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<any>(null);
  const [collectorData, setCollectorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [vehicleInput, setVehicleInput] = useState('');

 
  const loadCollector = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get('/locations/collector/me');
      console.log('Collector profile loaded:', res.data);
      setCollectorData(res.data);
      setActiveTab({ vehicle_number: res.data.vehicleNumber });
    } catch (e: any) {
      console.error('Failed to load collector profile', e);
      // Try fallback to /auth/me to display basic user info if collector profile is missing
      try {
        const me = await api.get('/auth/me');
        console.log('Fallback /auth/me loaded:', me.data);
        // Map to collectorData shape partially
        setCollectorData({ userId: me.data, vehicleNumber: null });
        setActiveTab({ vehicle_number: null });
        setLoadError('Collector profile missing; showing account info');
      } catch (meErr: any) {
        setCollectorData(null);
        const msg = e?.response?.data?.message || e?.message || 'Failed to load collector profile';
        setLoadError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCollector(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Collector Dashboard</h1>
            {collectorData && (
              <div className="text-sm text-muted-foreground">
                <p>Vehicle: {collectorData.vehicleNumber || collectorData.vehicleType || 'No vehicle info'}</p>
                <p>{collectorData.userId?.fullName || collectorData.userId?.username}</p>
                {collectorData.userId?.phone && <p className="text-xs">{collectorData.userId.phone}</p>}
              </div>
            )}
          </div>
          <Button variant="outline" className="shadow-medium" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-sm text-muted-foreground mb-4">Loading profile...</p>
        ) : collectorData ? (
          <Card className="mb-4 p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 text-primary w-12 h-12 flex items-center justify-center">🚚</div>
              <div>
                <div className="font-medium">{collectorData.userId?.fullName || collectorData.userId?.username}</div>
                {collectorData.userId?.phone && <div className="text-sm text-muted-foreground">{collectorData.userId.phone}</div>}
                <div className="text-sm text-muted-foreground">
                  {editingVehicle ? (
                    <div className="flex items-center gap-2">
                      <input className="input input-sm" value={vehicleInput} onChange={(e) => setVehicleInput(e.target.value)} placeholder="Vehicle number" />
                      <Button size="sm" onClick={async () => {
                        try {
                          const res = await api.put('/locations/collector/me', { vehicleNumber: vehicleInput });
                          setEditingVehicle(false);
                          setVehicleInput('');
                          loadCollector();
                          // Notify other UIs (admin) that collector info changed
                          try { window.dispatchEvent(new CustomEvent('collector:updated', { detail: res.data })); } catch (e) { /* ignore */ }
                          toast.success('Vehicle number updated');
                        } catch (err: any) {
                          console.error('Failed to update vehicle', err);
                          toast.error(err?.response?.data?.message || 'Failed to update vehicle');
                        }
                      }}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingVehicle(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div>{collectorData.vehicleNumber || collectorData.vehicleType || 'No vehicle info'}</div>

                      <Button size="sm" variant="outline" onClick={() => { setEditingVehicle(true); setVehicleInput(collectorData.vehicleNumber || ''); }}>Edit</Button>
                    </div>
                  )}
                </div>
                {collectorData.userId?.email && <div className="text-sm text-muted-foreground">{collectorData.userId.email}</div>}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Collector profile not found</div>
                {loadError && <div className="text-sm text-red-600">{loadError}</div>}
                <div className="text-sm text-muted-foreground">Make sure your account has the `collector` role and try again.</div>
              </div>
              <div>
                <Button onClick={loadCollector} variant="outline">Retry</Button>
              </div>
            </div>
          </Card>
        )}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="tasks">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="tasks">My Tasks</TabsTrigger>
                <TabsTrigger value="location">Location Sharing</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tasks">
              <Card className="p-6">
                <TaskList collectorId={collectorData?._id?.toString?.() || null} />
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card className="p-6">
                <LocationSharing collectorId={collectorData?._id?.toString?.()} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
