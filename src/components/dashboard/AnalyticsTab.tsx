
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, DollarSign, TrendingUp, Calendar } from "lucide-react";

const AnalyticsTab = ({ gymId }) => {
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    totalLeads: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    newMembersThisMonth: 0,
    newLeadsThisMonth: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [gymId]);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [membersResult, leadsResult, paymentsResult] = await Promise.all([
        supabase
          .from("members")
          .select("member_id, created_at, join_date")
          .eq("gym_id", gymId),
        supabase
          .from("leads")
          .select("lead_id, created_at")
          .eq("gym_id", gymId),
        supabase
          .from("payments")
          .select("amount, paid_on, created_at")
          .eq("gym_id", gymId)
      ]);

      const members = membersResult.data || [];
      const leads = leadsResult.data || [];
      const payments = paymentsResult.data || [];

      // Calculate metrics with proper type safety
      const totalRevenue = payments.reduce((sum, payment) => {
        const amount = Number(payment.amount) || 0;
        return sum + amount;
      }, 0);
      
      const monthlyPayments = payments.filter(payment => {
        const paymentDateStr = payment.paid_on || payment.created_at;
        if (!paymentDateStr) return false;
        const paymentDate = new Date(paymentDateStr);
        return !isNaN(paymentDate.getTime()) && paymentDate >= startOfMonth;
      });
      
      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => {
        const amount = Number(payment.amount) || 0;
        return sum + amount;
      }, 0);

      const newMembersThisMonth = members.filter(member => {
        const joinDateStr = member.join_date || member.created_at;
        if (!joinDateStr) return false;
        const joinDate = new Date(joinDateStr);
        return !isNaN(joinDate.getTime()) && joinDate >= startOfMonth;
      }).length;

      const newLeadsThisMonth = leads.filter(lead => {
        if (!lead.created_at) return false;
        const leadDate = new Date(lead.created_at);
        return !isNaN(leadDate.getTime()) && leadDate >= startOfMonth;
      }).length;

      setAnalytics({
        totalMembers: members.length,
        totalLeads: leads.length,
        totalRevenue,
        monthlyRevenue,
        newMembersThisMonth,
        newLeadsThisMonth,
        recentActivity: [
          ...members.slice(0, 3).map(m => ({ type: 'member', data: m })),
          ...leads.slice(0, 3).map(l => ({ type: 'lead', data: l })),
          ...payments.slice(0, 3).map(p => ({ type: 'payment', data: p }))
        ].sort((a, b) => {
          const dateA = new Date(a.data.created_at);
          const dateB = new Date(b.data.created_at);
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 5)
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newMembersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newLeadsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              ${analytics.monthlyRevenue} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalLeads > 0 ? Math.round((analytics.totalMembers / (analytics.totalMembers + analytics.totalLeads)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Leads to members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/Member</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalMembers > 0 ? Math.round(analytics.totalRevenue / analytics.totalMembers) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per member lifetime
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'member' ? 'bg-green-500' :
                  activity.type === 'lead' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.type === 'member' && `New member joined`}
                    {activity.type === 'lead' && `New lead inquiry`}
                    {activity.type === 'payment' && `Payment received: $${activity.data.amount}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.data.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {analytics.recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
