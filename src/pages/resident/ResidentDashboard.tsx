import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import BookingForm from '@/components/resident/BookingForm';
import ReportDumpingForm from '@/components/resident/ReportDumpingForm';
import TrackTrucks from '@/components/resident/TrackTrucks';
import MyBookings from '@/components/resident/MyBookings';
import MyReports from '@/components/resident/MyReports';
import { LogOut } from 'lucide-react';

const ResidentDashboard = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('book');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Resident Dashboard</h1>
          <Button variant="outline" className="shadow-medium" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="book">Book Service</TabsTrigger>
            <TabsTrigger value="report">Report Dumping</TabsTrigger>
            <TabsTrigger value="track">Track Trucks</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <BookingForm />
          </TabsContent>

          <TabsContent value="report">
            <ReportDumpingForm />
          </TabsContent>

          <TabsContent value="track">
            <TrackTrucks />
          </TabsContent>

          <TabsContent value="bookings">
            <MyBookings />
          </TabsContent>

          <TabsContent value="reports">
            <MyReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResidentDashboard;
