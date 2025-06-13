
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, MessageSquare, Copy, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { websocketService } from "@/services/websocket.service";

const QRCodeDisplay = ({ gym }) => {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<string>('initializing');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const activationText = "/activate";
  const whatsappUrl = `https://wa.me/${gym.phone_number}?text=${encodeURIComponent(activationText)}`;
  
  useEffect(() => {
    // Connect to WebSocket and join gym room
    const socket = websocketService.connect();
    websocketService.joinGymRoom(gym.gym_id);

    // Listen for QR code updates
    websocketService.onQRCode((qr) => {
      console.log('Received QR code from server');
      setQrCode(qr);
      setWhatsappStatus('awaiting_scan');
      setIsConnecting(false);
    });

    // Listen for status updates
    websocketService.onStatusChange((status) => {
      console.log('WhatsApp status changed:', status);
      setWhatsappStatus(status);
      if (status === 'connected') {
        setQrCode(null);
        setIsConnecting(false);
        toast({
          title: "WhatsApp Connected!",
          description: "Your WhatsApp bot is now active and ready to help your gym members.",
        });
      }
    });

    // Initialize WhatsApp connection
    connectWhatsApp();

    return () => {
      websocketService.disconnect();
    };
  }, [gym.gym_id]);

  const connectWhatsApp = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/gyms/${gym.gym_id}/whatsapp/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Connect response:', data);
      
      if (data.status === 'connected') {
        setWhatsappStatus('connected');
        setIsConnecting(false);
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
        setWhatsappStatus('awaiting_scan');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to WhatsApp service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whatsappUrl);
    toast({
      title: "Copied!",
      description: "WhatsApp activation link copied to clipboard",
    });
  };

  const getStatusDisplay = () => {
    switch (whatsappStatus) {
      case 'connected':
        return {
          title: "WhatsApp Bot Active!",
          description: "Your AI assistant is connected and ready to help your gym members.",
          color: "text-green-800",
          bgColor: "bg-green-50",
          icon: <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        };
      case 'awaiting_scan':
        return {
          title: "Scan QR Code to Activate",
          description: "Use WhatsApp to scan the QR code below and activate your bot.",
          color: "text-blue-800",
          bgColor: "bg-blue-50",
          icon: <MessageSquare className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        };
      default:
        return {
          title: "Initializing WhatsApp Connection",
          description: "Setting up your WhatsApp bot connection...",
          color: "text-gray-800",
          bgColor: "bg-gray-50",
          icon: <Loader2 className="h-16 w-16 text-gray-600 mx-auto mb-4 animate-spin" />
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            {statusDisplay.icon}
            <CardTitle className={`text-3xl font-bold ${statusDisplay.color}`}>
              {statusDisplay.title}
            </CardTitle>
            <CardDescription>
              Your gym "{gym.name}" has been registered. {statusDisplay.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {whatsappStatus !== 'connected' && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Activation Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Wait for the QR code to appear below</li>
                  <li>Open WhatsApp on your phone → Menu → Linked Devices → Link a Device</li>
                  <li>Scan the QR code with your phone</li>
                  <li>Your AI assistant will be ready to help your gym members!</li>
                </ol>
              </div>
            )}

            {qrCode && whatsappStatus === 'awaiting_scan' && (
              <div className="text-center space-y-4">
                <div className="bg-white p-8 rounded-lg border inline-block">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64 mx-auto"
                  />
                  <p className="text-sm text-gray-600 mt-4">
                    Scan this QR code with WhatsApp
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    WhatsApp → Menu → Linked Devices → Link a Device
                  </p>
                </div>
              </div>
            )}

            {whatsappStatus === 'initializing' && (
              <div className="text-center space-y-4">
                <div className="bg-white p-8 rounded-lg border">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-sm text-gray-600">
                    Initializing WhatsApp connection...
                  </p>
                  {isConnecting && (
                    <p className="text-xs text-gray-500 mt-2">
                      This may take a few moments
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {whatsappStatus !== 'connected' && (
                <Button
                  onClick={connectWhatsApp}
                  disabled={isConnecting}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Retry Connection
                    </>
                  )}
                </Button>
              )}
              
              <Button
                onClick={() => window.open(whatsappUrl, '_blank')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Open WhatsApp Chat
              </Button>
              
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Activation Link
              </Button>
            </div>

            <div className={`${statusDisplay.bgColor} p-4 rounded-lg`}>
              <h4 className={`font-medium ${statusDisplay.color} mb-2`}>
                {whatsappStatus === 'connected' ? "Your Bot is Ready!" : "What's Next?"}
              </h4>
              <ul className={`text-sm ${statusDisplay.color.replace('800', '700')} space-y-1`}>
                {whatsappStatus === 'connected' ? (
                  <>
                    <li>• Your members can now chat with your AI assistant</li>
                    <li>• Access your admin dashboard to manage members and leads</li>
                    <li>• Set up payment tracking and notifications</li>
                    <li>• Start broadcasting messages to your community</li>
                  </>
                ) : (
                  <>
                    <li>• Complete WhatsApp connection setup above</li>
                    <li>• Access your admin dashboard to manage members and leads</li>
                    <li>• Set up payment tracking and notifications</li>
                    <li>• Start broadcasting messages to your community</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <Link to="/admin-login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Admin Dashboard
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
