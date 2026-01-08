import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MyReports = () => {
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/user');
      const data: any[] = res.data;
      // normalize id and reportedAt
      const normalized = data.map(r => ({ ...r, id: (r._id || r.id)?.toString?.() || '', reportedAt: r.reportedAt || r.createdAt }));
      setReports(normalized);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Could not load reports');
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();

    const handler = () => fetchReports();
    window.addEventListener('report:created', handler);
    window.addEventListener('report:updated', handler);
    window.addEventListener('task:updated', (e: any) => { if (e?.detail?.type === 'report') fetchReports(); });
    return () => {
      window.removeEventListener('report:created', handler);
      window.removeEventListener('report:updated', handler);
      window.removeEventListener('task:updated', (e: any) => {});
    };
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared': return 'bg-green-500/10 text-green-600';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600';
      case 'assigned': return 'bg-yellow-500/10 text-yellow-600';
      case 'rejected': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Reports</h2>
      
      {reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No reports submitted yet</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{report.locationAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{report.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MyReports;
