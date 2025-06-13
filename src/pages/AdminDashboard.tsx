
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import MembersTab from "@/components/dashboard/MembersTab";
import LeadsTab from "@/components/dashboard/LeadsTab";
import PaymentsTab from "@/components/dashboard/PaymentsTab";
import BroadcastTab from "@/components/dashboard/BroadcastTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const adminData = localStorage.getItem("gymAdmin");
    if (!adminData) {
      navigate("/admin-login");
      return;
    }
    setAdmin(JSON.parse(adminData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("gymAdmin");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{admin.gym_name}</h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <MembersTab gymId={admin.gym_id} />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsTab gymId={admin.gym_id} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab gymId={admin.gym_id} />
          </TabsContent>

          <TabsContent value="broadcast">
            <BroadcastTab gymId={admin.gym_id} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab gymId={admin.gym_id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
