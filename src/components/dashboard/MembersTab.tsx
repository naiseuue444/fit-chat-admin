
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MembersTab = ({ gymId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    join_date: "",
    next_payment_date: "",
    goal: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [gymId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const { error } = await supabase
          .from("members")
          .update(formData)
          .eq("member_id", editingMember.member_id);
        if (error) throw error;
        toast({ title: "Member updated successfully!" });
      } else {
        const { error } = await supabase
          .from("members")
          .insert([{ ...formData, gym_id: gymId }]);
        if (error) throw error;
        toast({ title: "Member added successfully!" });
      }

      fetchMembers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (memberId) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("member_id", memberId);
      
      if (error) throw error;
      toast({ title: "Member deleted successfully!" });
      fetchMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      number: "",
      join_date: "",
      next_payment_date: "",
      goal: ""
    });
    setEditingMember(null);
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      number: member.number || "",
      join_date: member.join_date || "",
      next_payment_date: member.next_payment_date || "",
      goal: member.goal || ""
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Members ({members.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Member" : "Add New Member"}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? "Update member information" : "Add a new member to your gym"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="number">Phone Number *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="join_date">Join Date</Label>
                <Input
                  id="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="next_payment_date">Next Payment Date</Label>
                <Input
                  id="next_payment_date"
                  type="date"
                  value={formData.next_payment_date}
                  onChange={(e) => setFormData({...formData, next_payment_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="goal">Fitness Goal</Label>
                <Input
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  placeholder="Weight loss, muscle gain, etc."
                />
              </div>
              <Button type="submit" className="w-full">
                {editingMember ? "Update Member" : "Add Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {members.map((member) => (
          <Card key={member.member_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.number}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(member.member_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Joined:</span>
                  <p>{member.join_date || "Not set"}</p>
                </div>
                <div>
                  <span className="font-medium">Next Payment:</span>
                  <p>{member.next_payment_date || "Not set"}</p>
                </div>
                <div>
                  <span className="font-medium">Goal:</span>
                  <p>{member.goal || "Not specified"}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="text-green-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {members.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No members found. Add your first member!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MembersTab;
