
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppConnection } from "@/components/WhatsAppConnection";
import { MessageSquare, Settings, Wifi, WifiOff, RefreshCw } from "lucide-react";

interface WhatsAppTabProps {
  gymId: string;
}

const WhatsAppTab = ({ gymId }: WhatsAppTabProps) => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<string>('checking');
  const [lastConnected, setLastConnected] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, [gymId]);

  const checkConnectionStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/gyms/${gymId}/whatsapp/status`);
      const data = await response.json();
      setConnectionStatus(data.status || 'disconnected');
      if (data.connectedAt) {
        setLastConnected(new Date(data.connectedAt).toLocaleString());
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: "Failed to check WhatsApp connection status",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><Wifi className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'awaiting_scan':
        return <Badge className="bg-yellow-100 text-yellow-800"><MessageSquare className="w-3 h-3 mr-1" />Awaiting Scan</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800"><WifiOff className="w-3 h-3 mr-1" />Disconnected</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><WifiOff className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Checking...</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">WhatsApp Integration</h2>
        <p className="text-muted-foreground">
          Manage your gym's WhatsApp bot connection and settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Connection Status
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={checkConnectionStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Current WhatsApp bot connection status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {getStatusBadge()}
            </div>
            {lastConnected && (
              <div className="flex items-center justify-between">
                <span>Last Connected:</span>
                <span className="text-sm text-muted-foreground">{lastConnected}</span>
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">What your bot can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Answer member questions 24/7</li>
                <li>• Help with membership inquiries</li>
                <li>• Provide class schedules and gym information</li>
                <li>• Capture and qualify new leads</li>
                <li>• Send automated reminders and updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common WhatsApp management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(`https://wa.me/YOUR_BOT_NUMBER`, '_blank')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Test Bot Conversation
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({ title: "Feature Coming Soon", description: "Bot customization will be available soon!" })}
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize Bot Responses
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={checkConnectionStatus}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Connection Health
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Connection Manager</CardTitle>
          <CardDescription>
            Connect or reconnect your WhatsApp bot to start helping your members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsAppConnection gymId={gymId} />
        </CardContent>
      </Card>

      {connectionStatus === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Health</CardTitle>
            <CardDescription>
              Monitor your WhatsApp bot performance and connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-green-700">Bot Status</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-blue-700">Availability</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Ready</div>
                <div className="text-sm text-purple-700">To Help</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppTab;
