import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import MapView from '@/components/ui/map-view';

interface TaskDetailsProps {
  task: any | null;
  open: boolean;
  onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, open, onClose }) => {
  if (!task) return null;

  const lat = task.locationLat || task.latitude || task.location?.lat || task.locationLat;
  const lng = task.locationLng || task.longitude || task.location?.lng || task.locationLng;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>Details for the selected task</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="font-medium">Resident: {task.user?.fullName || task.residentName || task.userId?.fullName || 'Unknown'}</p>
          {task.user?.phone || task.userId?.phone ? (
            <p className="text-sm text-muted-foreground">Phone: {task.user?.phone || task.userId?.phone}</p>
          ) : null}

          <p className="mt-2">Type: {task.type || (task.serviceType ? 'booking' : 'report')}</p>
          <p className="mt-2">Status: {task.status}</p>
          <p className="mt-2">Description: {task.details || task.description || task.notes || ''}</p>
        </div>

        {lat && lng ? (
          <div className="h-64 rounded-md overflow-hidden">
            <MapView center={[Number(lat), Number(lng)] as [number, number]} zoom={14} markers={[{ position: [Number(lat), Number(lng)], title: task.user?.fullName || 'Resident', description: task.details || task.description }]} />
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
