import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

const ManageCollectors = () => {
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    vehicleNumber: '',
    vehicleType: ''
  });

  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations/admin/collectors');
      // backend returns array of detailedLocations
      setCollectors(res.data || []);
    } catch (err: any) {
      console.error('Failed to load collectors', err);
      toast.error('Failed to load collectors');
    }
    setLoading(false);
  };

  const createCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        username: (formData.username || '').trim().toLowerCase(),
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        ...(formData.vehicleNumber ? { vehicleNumber: formData.vehicleNumber } : {}),
        ...(formData.vehicleType ? { vehicleType: formData.vehicleType } : {})
      };
      await api.post('/admin/collectors', payload);
      toast.success('Collector created successfully!');
      setOpen(false);
      setFormData({  username: '',fullName: '', email: '', phone: '', password: '', vehicleNumber: '', vehicleType: '' });
      fetchCollectors();
    } catch (err: any) {
      console.error('Failed to create collector', err);
      toast.error(err.response?.data?.message || 'Failed to create collector');
    }
  };

  const deleteCollector = async (userId: string) => {
    if (!confirm('Delete this collector?')) return;
    try {
      await api.delete(`/admin/collectors/${userId}`);
      toast.success('Collector deleted');
      fetchCollectors();
    } catch (err: any) {
      console.error('Failed to delete collector', err);
      toast.error(err.response?.data?.message || 'Failed to delete collector');
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Collectors</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Collector
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collector</DialogTitle>
            </DialogHeader>
            <form onSubmit={createCollector} className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Vehicle Number</Label>
                <Input
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Vehicle Type</Label>
                <Input
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  placeholder="e.g., Truck, Van"
                />
              </div>
              <Button type="submit" className="w-full">Create Collector</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {collectors.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No collectors created</p>
      ) : (
        <div className="space-y-3">
          {collectors.map((collector) => {
            // collector may be shaped with collectorId, userId, name, vehicleNumber
            const userName = collector.name || (collector.userId && collector.userId.fullName) || '';
            const phone = collector.phone || (collector.userId && collector.userId.phone) || '';
            const vehicle = collector.vehicleNumber || '';
            const userId = collector.userId?._id || collector.userId || collector.userId?.id;
            const key = collector.collectorId || collector._id || collector.id;
            return (
              <div key={key} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">{vehicle}</p>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                </div>
                
                <Button size="sm" variant="destructive" onClick={() => deleteCollector(userId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ManageCollectors;
