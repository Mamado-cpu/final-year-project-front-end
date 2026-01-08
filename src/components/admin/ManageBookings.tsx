import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { Label } from '@/components/ui/label';

const ManageBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState<'all' | 'garbage' | 'sewage'>('all');

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    window.addEventListener('booking:updated', handler);
    window.addEventListener('task:updated', (e: any) => { if (e?.detail?.type === 'booking') fetchData(); });
    return () => {
      window.removeEventListener('booking:updated', handler);
      window.removeEventListener('task:updated', (e: any) => {});
    };
  }, [filterService]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = filterService !== 'all' ? `?serviceType=${filterService}` : '';
      const [bkRes, colRes] = await Promise.all([
        api.get(`/bookings/all${q}`),
        api.get('/locations/admin/collectors')
      ]);

      const bookingsData = bkRes.data || [];
      const collectorsData = colRes.data || [];

      const enriched = bookingsData.map((b: any) => ({
        ...b,
        residentName: b.userId?.fullName || b.userId?.email || 'Resident',
        collectorVehicle: b.collectorId?.vehicleNumber || null
      }));

      setBookings(enriched);
      setCollectors(collectorsData);
    } catch (err: any) {
      console.error('Failed to load admin bookings or collectors', err);
      toast.error('Failed to load bookings');
    }
    setLoading(false);
  };

  const assignCollector = async (bookingId: string, collectorId: string) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'assigned', collectorId });
      toast.success('Collector assigned!');
      fetchData();
    } catch (err: any) {
      console.error('Assign collector error', err);
      toast.error(err.response?.data?.message || 'Failed to assign collector');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600';
      case 'assigned': return 'bg-yellow-500/10 text-yellow-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Bookings</h2>
      
      <div className="mb-4 flex items-center gap-3">
        <div className="w-56">
          <Label>Filter by Service</Label>
          <select value={filterService} onChange={(e) => setFilterService(e.target.value as any)} className="w-full p-2 rounded-md border">
            <option value="all">All</option>
            <option value="garbage">Garbage Collection</option>
            <option value="sewage">Sewage Disposal</option>
          </select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No bookings yet</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking._id || booking.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{booking.locationAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    Resident: {booking.residentName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.requestedAt).toLocaleString()}
                  </p>
                  {booking.collectorVehicle && (
                    <p className="text-sm text-muted-foreground">
                      Assigned: {booking.collectorVehicle}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {booking.status === 'pending' && (
                <div className="flex gap-2 items-center mt-3">
                  <Select onValueChange={(value) => assignCollector(booking._id || booking.id, value)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Assign collector" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectors.map((collector) => {
                        const cid = collector.collectorId || collector._id || collector.id;
                        return (
                          <SelectItem key={cid} value={cid}>
                            {collector.vehicleNumber}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ManageBookings;
