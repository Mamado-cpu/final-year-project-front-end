import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReportDumpingForm = () => {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [description, setDescription] = useState('');
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

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !lat || !lng || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);
    try{
      const payload: any = {
        locationAddress: address,
        locationLat: parseFloat(lat),
        locationLng: parseFloat(lng),
        description,
        photoUrl: null,
      };
    // getMockReports();
    // const newReport: MockReport = {
    //   id: `report-${Date.now()}`,
    //   userId: user.id,
    //   collectorId: null,
    //   locationAddress: address,
    //   locationLat: parseFloat(lat),
    //   locationLng: parseFloat(lng),
    //   description,
    //   photoUrl: null,
    //   status: 'pending',
    //   reportedAt: new Date().toISOString(),
    //   assignedAt: null,
    //   startedAt: null,
    //   clearedAt: null,
    // };

      const res = await api.post('/reports', payload);
      setLoading(false);
      toast.success('Report submitted successfully!');
      // clear form
      setAddress('');
      setLat('');
      setLng('');
      setDescription('');
      // refresh report list UI
      window.dispatchEvent(new Event('report:created'));
      navigate('/resident/reports');
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || err.message || 'Failed to create report');
    }
  }
    
    

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Report Illegal Dumping</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="address">Location Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter location address"
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the illegal dumping..."
            rows={4}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </Card>
  );

}
export default ReportDumpingForm;
