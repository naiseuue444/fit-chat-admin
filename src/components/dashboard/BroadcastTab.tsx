
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Users, UserCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BroadcastTab = ({ gymId }) => {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [gymId]);

  const fetchData = async () => {
    try {
      const [broadcastsResult, membersResult, leadsResult] = await Promise.all([
        supabase
          .from("broadcast_queue")
          .select("*")
          .eq("gym_id", gymId)
          .order("created_at", { ascending: false }),
        supabase
          .from("members")
          .select("member_id")
          .eq("gym_id", gymId),
        supabase
          .from("leads")
          .select("lead_id")
          .eq("gym_id", gymId)
      ]);

      setBroadcasts(broadcastsResult.data || []);
      setMemberCount(membersResult.data?.length || 0);
      setLeadCount(leadsResult.data?.length || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !target) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("broadcast_queue")
        .insert([{
          gym_id: gymId,
          message: message.trim(),
          target
        }]);

      if (error) throw error;

      toast({
        title: "Broadcast queued!",
        description: `Message will be sent to all ${target}`,
      });

      setMessage("");
      setTarget("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetCount = (targetType) => {
    return targetType === "members" ? memberCount : leadCount;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">
              Available for broadcast
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadCount}</div>
            <p className="text-xs text-muted-foreground">
              Potential members
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Broadcast Message</CardTitle>
          <CardDescription>
            Send a message to all members or leads via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="target">Target Audience *</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">
                    Members ({memberCount} people)
                  </SelectItem>
                  <SelectItem value="leads">
                    Leads ({leadCount} people)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message here..."
                rows={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {message.length}/1000 characters
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !target || !message.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Queueing..." : `Send to ${target ? getTargetCount(target) : 0} ${target}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
          <CardDescription>
            Recent broadcast messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {broadcasts.map((broadcast) => (
              <div key={broadcast.broadcast_id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium capitalize">
                    To: {broadcast.target}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    broadcast.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {broadcast.sent ? 'Sent' : 'Queued'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{broadcast.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(broadcast.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            
            {broadcasts.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No broadcasts sent yet. Send your first message above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastTab;
