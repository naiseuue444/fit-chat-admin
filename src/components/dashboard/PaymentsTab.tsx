
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, DollarSign, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PaymentsTab = ({ gymId }) => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    member_id: "",
    amount: "",
    paid_on: "",
    next_due: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [gymId]);

  const fetchData = async () => {
    try {
      const [paymentsResult, membersResult] = await Promise.all([
        supabase
          .from("payments")
          .select("*, members(name, number)")
          .eq("gym_id", gymId)
          .order("created_at", { ascending: false }),
        supabase
          .from("members")
          .select("member_id, name")
          .eq("gym_id", gymId)
      ]);

      if (paymentsResult.error) throw paymentsResult.error;
      if (membersResult.error) throw membersResult.error;

      setPayments(paymentsResult.data || []);
      setMembers(membersResult.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("payments")
        .insert([{ ...formData, gym_id: gymId, amount: parseInt(formData.amount) }]);
      
      if (error) throw error;
      
      toast({ title: "Payment recorded successfully!" });
      fetchData();
      setIsDialogOpen(false);
      setFormData({ member_id: "", amount: "", paid_on: "", next_due: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDuePayments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return payments.filter(payment => {
      if (!payment.next_due) return false;
      const dueDate = new Date(payment.next_due);
      return dueDate <= today;
    });
  };

  if (loading) return <div>Loading payments...</div>;

  const duePayments = getDuePayments();
  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{duePayments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Add a new payment record for a member
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="member_id">Member *</Label>
                <Select value={formData.member_id} onValueChange={(value) => setFormData({...formData, member_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.member_id} value={member.member_id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="paid_on">Payment Date *</Label>
                <Input
                  id="paid_on"
                  type="date"
                  value={formData.paid_on}
                  onChange={(e) => setFormData({...formData, paid_on: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="next_due">Next Due Date</Label>
                <Input
                  id="next_due"
                  type="date"
                  value={formData.next_due}
                  onChange={(e) => setFormData({...formData, next_due: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">
                Record Payment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {duePayments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Payments Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {duePayments.map((payment) => (
                <div key={payment.payment_id} className="flex justify-between items-center">
                  <span>{payment.members.name}</span>
                  <span className="text-red-600">Due: {payment.next_due}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.payment_id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{payment.members.name}</h3>
                  <p className="text-sm text-gray-600">{payment.members.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${payment.amount}</p>
                  <p className="text-sm text-gray-600">
                    Paid: {payment.paid_on}
                  </p>
                  {payment.next_due && (
                    <p className="text-sm text-gray-600">
                      Next: {payment.next_due}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {payments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No payments recorded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentsTab;
