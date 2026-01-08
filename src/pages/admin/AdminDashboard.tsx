import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ManageResidents from '@/components/admin/ManageResidents';
import ManageCollectors from '@/components/admin/ManageCollectors';
import ManageBookings from '@/components/admin/ManageBookings';
import ManageReports from '@/components/admin/ManageReports';
import LiveTracking from '@/components/admin/LiveTracking';
import { LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('residents');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" className="shadow-medium" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="residents">Residents</TabsTrigger>
            <TabsTrigger value="collectors">Collectors</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="residents">
            <ManageResidents />
          </TabsContent>

          <TabsContent value="collectors">
            <ManageCollectors />
          </TabsContent>

          <TabsContent value="bookings">
            <ManageBookings />
          </TabsContent>

          <TabsContent value="reports">
            <ManageReports />
          </TabsContent>

          <TabsContent value="tracking">
            <LiveTracking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
