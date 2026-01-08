import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import api from '@/lib/api';

const BookingForm = () => {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceType, setServiceType] = useState<'sewage' | 'garbage'>('garbage');
  const [bags, setBags] = useState<number | ''>('');
  const [tankVolume, setTankVolume] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
          toast.success('Location captured!');
        },
        (error) => {
          toast.error('Unable to get location');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !lat || !lng) {
      toast.error('Please provide address and location');
      return;
    }

    // client-side validation for service-specific fields
    if (serviceType === 'garbage') {
      const b = Number(bags);
      if (!Number.isFinite(b) || b <= 0) {
        return toast.error('Please enter a valid number of bags (>=1)');
      }
    }
    if (serviceType === 'sewage') {
      const v = Number(tankVolume);
      if (!Number.isFinite(v) || v <= 0) {
        return toast.error('Please enter a valid tank volume in liters (positive number)');
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        locationAddress: address,
        locationLat: parseFloat(lat),
        locationLng: parseFloat(lng),
        notes,
        serviceType,
        serviceDetails: serviceType === 'garbage' ? { bags: bags || 1 } : { tankVolume: tankVolume || null }
      };

      const res = await api.post('/bookings', payload);
      setLoading(false);
      toast.success('Booking created successfully! Awaiting assignment.');
      // clear form
      setAddress('');
      setLat('');
      setLng('');
      setNotes('');
      setServiceType('garbage');
      setBags('');
      setTankVolume('');
      // optionally refresh bookings list by dispatching an event
      window.dispatchEvent(new Event('booking:created'));
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || err.message || 'Failed to create booking');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Book Service</h2>
      <div className="mb-4">
        <Label htmlFor="serviceType">Service Type</Label>
        <select id="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value as 'sewage' | 'garbage')} className="w-full rounded-md border p-2">
          <option value="garbage">Garbage Collection</option>
          <option value="sewage">Sewage Disposal</option>
        </select>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="address">Location Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="13.4549"
              required
            />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-16.5790"
              required
            />
          </div>
        </div>

        <Button type="button" variant="outline" onClick={getCurrentLocation} className="w-full">
          <MapPin className="mr-2 h-4 w-4" />
          Use Current Location
        </Button>

        <div>
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions..."
            rows={3}
          />
        </div>

        {serviceType === 'garbage' && (
          <div>
            <Label htmlFor="bags">Number of Bags</Label>
            <Input id="bags" type="number" value={bags as any} onChange={(e) => setBags(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 2" />
          </div>
        )}

        {serviceType === 'sewage' && (
          <div>
            <Label htmlFor="tankVolume">Estimated Tank Volume (Liters)</Label>
            <Input id="tankVolume" type="text" value={tankVolume} onChange={(e) => setTankVolume(e.target.value)} placeholder="e.g. 2000" />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Booking'}
        </Button>
      </form>
    </Card>
  );
};

export default BookingForm;
