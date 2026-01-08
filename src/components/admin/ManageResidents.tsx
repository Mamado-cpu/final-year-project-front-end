import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import api from '@/lib/api';

const ManageResidents = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users?role=resident');
      const users = res.data || [];
      setResidents(users);
    } catch (err: any) {
      console.error('Failed to fetch residents', err);
      toast.error('Failed to load residents');
    }
    setLoading(false);
  };

  const deleteResident = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resident?')) return;
    try {
      // backend expects userId param
      await api.delete(`/admin/users/${id}`);
      toast.success('Resident deleted');
      fetchResidents();
    } catch (err: any) {
      console.error('Failed to delete resident', err);
      toast.error(err.response?.data?.message || 'Failed to delete resident');
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Residents</h2>
      
      {residents.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No residents registered</p>
      ) : (
        <div className="space-y-3">
          {residents.map((resident) => (
            <div key={resident._id || resident.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{resident.fullName}</p>
                </div>
                <p className="text-sm text-muted-foreground">{resident.email}</p>
                <p className="text-sm text-muted-foreground">{resident.phone}</p>
              </div>
              
                <div className="flex gap-2">
                {/* Approval button removed — residents are auto-approved */}
                <Button size="sm" variant="destructive" onClick={() => deleteResident(resident._id || resident.id)}>
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ManageResidents;
