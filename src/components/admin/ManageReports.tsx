import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';

const ManageReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    const taskHandler = (e: any) => { if (e?.detail?.type === 'report') fetchData(); };
    const collectorHandler = () => fetchData();
    window.addEventListener('report:updated', handler);
    window.addEventListener('task:updated', taskHandler);
    window.addEventListener('collector:updated', collectorHandler);
    return () => {
      window.removeEventListener('report:updated', handler);
      window.removeEventListener('task:updated', taskHandler);
      window.removeEventListener('collector:updated', collectorHandler);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use admin collectors endpoint which returns detailed collector list (array)
      const [reportsRes, collectorsRes, usersRes] = await Promise.all([
        api.get('/reports/all'),
        api.get('/locations/admin/collectors'),
        api.get('/admin/users')
      ]);

      const reportsData = reportsRes.data as any[];
      const collectorsData = collectorsRes.data as any[];
      const users = usersRes.data as any[];

      const enrichedReports = reportsData.map(r => {
        const id = (r._id || r.id)?.toString?.() || '';
        // reporterName: backend may populate userId
        const reporterName = (r.userId && (r.userId.fullName || r.userId.name)) || users.find(u => ((u._id || u.id)?.toString?.() === (r.userId?._id || r.userId)?.toString?.()))?.fullName;

        // collectorVehicle: collectorsData is an array of detailedLocations with collectorId
        const coll = collectorsData.find(c => ((c.collectorId || c._id || c.id)?.toString?.() || '') === ((r.collectorId || '')?.toString?.() || ''));
        const collectorVehicle = coll?.vehicleNumber || coll?.vehicle?.vehicleNumber || null;

        return {
          ...r,
          id,
          reporterName: reporterName || 'Unknown',
          collectorVehicle,
          reportedAt: r.reportedAt || r.createdAt || r.createdAtAt || r.created_at
        };
      });

      setReports(enrichedReports);
      setCollectors(collectorsData);
    } catch (err: any) {
      // API failed — surface error and clear lists
      const msg = err.response?.data?.message || err.message || 'Failed to load reports';
      toast.error(msg);
      setReports([]);
      setCollectors([]);
    }

    setLoading(false);
  };

  const assignCollector = async (reportId: string, collectorId: string) => {
    try {
      const res = await api.put(`/reports/${reportId}/status`, { collectorId, status: 'assigned' });
      toast.success('Collector assigned!');
      const updated = res.data;
      if (updated) {
        const updatedId = (updated._id || updated.id)?.toString?.();
        setReports((prev) => prev.map(r => ((r.id?.toString?.() || r.id) === updatedId) ? { ...r, ...updated, status: updated.status || 'assigned' } : r));
      } else {
        // fallback: set local report status to assigned
        setReports((prev) => prev.map(r => (r.id === reportId ? { ...r, status: 'assigned' } : r)));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to assign collector';
      toast.error(msg);
    }
  };

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
      <h2 className="text-2xl font-bold mb-6">Manage Reports</h2>
      
      {reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No reports yet</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{report.locationAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    Reporter: {report.reporterName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.reportedAt).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1">{report.description}</p>
                  {report.collectorVehicle && (
                    <p className="text-sm text-muted-foreground">
                      Assigned: {report.collectorVehicle}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {report.status === 'pending' && (
                <div className="flex gap-2 items-center mt-3">
                  <Select onValueChange={(value) => assignCollector(report.id, value)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Assign collector" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectors.map((collector) => {
                        const id = (collector.collectorId || collector._id || collector.id)?.toString?.() || '';
                        const label = collector.vehicleNumber || collector.vehicle?.vehicleNumber || collector.vehicleNumber || id;
                        return (
                          <SelectItem key={id} value={id}>
                            {label}
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

export default ManageReports;
