
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, UserPlus } from "lucide-react";

const LeadsTab = ({ gymId }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, [gymId]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToMember = async (lead) => {
    try {
      // Add to members table
      const { error: memberError } = await supabase
        .from("members")
        .insert([{
          gym_id: gymId,
          name: lead.name,
          number: lead.number,
          goal: lead.goal,
          join_date: new Date().toISOString().split('T')[0]
        }]);

      if (memberError) throw memberError;

      // Remove from leads
      const { error: leadError } = await supabase
        .from("leads")
        .delete()
        .eq("lead_id", lead.lead_id);

      if (leadError) throw leadError;

      toast({
        title: "Success!",
        description: `${lead.name} has been converted to a member`,
      });

      fetchLeads();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading leads...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leads ({leads.length})</h2>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.lead_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <CardDescription>{lead.number}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/${lead.number}`, '_blank')}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => convertToMember(lead)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Convert
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Goal:</span>
                  <p className="text-sm">{lead.goal || "Not specified"}</p>
                </div>
                {lead.message && (
                  <div>
                    <span className="font-medium">Message:</span>
                    <p className="text-sm bg-gray-50 p-2 rounded">{lead.message}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Inquired:</span>
                  <p className="text-sm">{new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {leads.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No leads yet. Share your lead form to start collecting inquiries!</p>
              <Button className="mt-4" onClick={() => {
                const leadFormUrl = `${window.location.origin}/lead-form/${gymId}`;
                navigator.clipboard.writeText(leadFormUrl);
                toast({ title: "Lead form URL copied to clipboard!" });
              }}>
                Copy Lead Form URL
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadsTab;
