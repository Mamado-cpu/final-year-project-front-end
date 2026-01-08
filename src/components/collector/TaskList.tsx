import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import TaskDetails from './TaskDetails';

interface Task {
  id: string;
  type: 'booking' | 'report';
  locationAddress: string;
  status: string;
  details: string;
}

const TaskList = ({ collectorId }: { collectorId: string | null }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectorProfile, setCollectorProfile] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchCollectorProfile();
  }, [collectorId]);

  const fetchCollectorProfile = async () => {
    try {
      const res = await api.get('/locations/collector/me');
      setCollectorProfile(res.data || null);
    } catch (err) {
      console.warn('Failed to load collector profile for TaskList', err);
    }
  };

  useEffect(() => {
    console.log('TaskList collectorId changed:', collectorId);
  }, [collectorId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bkRes, repRes] = await Promise.all([
        api.get('/bookings/collector'),
        api.get('/reports/collector')
      ]);

      console.log('bookings response', bkRes);
      console.log('reports response', repRes);
      const bookings = bkRes.data || [];
      const reports = repRes.data || [];

      const allTasks: Task[] = [
        ...bookings.filter((b: any) => b.status !== 'completed').map((b: any) => ({
          id: b._id || b.id,
          type: 'booking' as const,
          locationAddress: b.locationAddress,
          status: b.status,
          details: b.notes || 'Sewage disposal service',
          user: b.userId || b.user,
          locationLat: b.locationLat,
          locationLng: b.locationLng,
          raw: b
        })),
        ...reports.filter((r: any) => r.status !== 'cleared').map((r: any) => ({
          id: r._id || r.id,
          type: 'report' as const,
          locationAddress: r.locationAddress,
          status: r.status,
          details: r.description,
          user: r.userId || r.user,
          locationLat: r.locationLat || r.locationLat,
          locationLng: r.locationLng || r.locationLng,
          raw: r
        }))
      ];

      setTasks(allTasks);
    } catch (err: any) {
      console.error('Failed to load tasks', err);
      const msg = err?.response?.data?.message || err.message || 'Failed to load tasks';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  const updateTaskStatus = (task: Task, newStatus: string) => {
    (async () => {
      try {
        if (task.type === 'booking') {
          const id = task.id;
          await api.put(`/bookings/${id}/status`, { status: newStatus });
        } else {
          const id = task.id;
          await api.put(`/reports/${id}/status`, { status: newStatus });
        }
        toast.success('Status updated successfully');
        // Refresh local list and notify other parts of the app
        fetchTasks();
        const detail = { id: task.id, type: task.type, status: newStatus };
        window.dispatchEvent(new CustomEvent('task:updated', { detail }));
        if (task.type === 'booking') window.dispatchEvent(new CustomEvent('booking:updated', { detail }));
        if (task.type === 'report') window.dispatchEvent(new CustomEvent('report:updated', { detail }));
      } catch (err: any) {
        console.error('Failed to update task status', err);
        toast.error(err.response?.data?.message || 'Failed to update status');
      }
    })();
  };

  if (loading) {
    return <Card className="p-6"><p>Loading tasks...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Tasks</h2>
      {collectorProfile ? (
        <div className="mb-4 flex items-center gap-4">
          <div className="rounded-full bg-primary/10 text-primary w-12 h-12 flex items-center justify-center">🚚</div>
          <div>
            <p className="font-medium">{collectorProfile.userId?.fullName || collectorProfile.userId?.username || 'Collector'}</p>
            <p className="text-sm text-muted-foreground">{collectorProfile.vehicleNumber || collectorProfile.vehicleType || 'No vehicle info'}</p>
            {collectorProfile.userId?.phone && <p className="text-xs text-muted-foreground">{collectorProfile.userId.phone}</p>}
          </div>
        </div>
      ) : (
        !collectorId && <p className="text-sm text-muted-foreground mb-4">Collector profile not yet loaded — showing tasks for authenticated collector.</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}
      
      {tasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No tasks assigned</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={String(task.id)} className="border rounded-lg p-4 cursor-pointer" onClick={() => { setSelectedTask(task); setDetailsOpen(true); }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {task.type === 'booking' ? '🚰 Sewage' : '🚨 Report'}
                  </Badge>
                  <p className="font-medium">{task.locationAddress}</p>
                  <p className="text-sm text-muted-foreground mt-1">{task.details}</p>
                </div>
                <Badge>{(task.status || 'pending').replace('_', ' ')}</Badge>
              </div>
              
              <div className="flex gap-2 mt-3">
                {task.status === 'assigned' && (
                  <Button 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); updateTaskStatus(task, 'in_progress'); }}
                  >
                    Start Task
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <Button 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); updateTaskStatus(task, task.type === 'booking' ? 'completed' : 'cleared'); }}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <TaskDetails task={selectedTask} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </Card>
  );
};

export default TaskList;
