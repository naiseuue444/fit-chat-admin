
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QRCodeDisplay = ({ gym }) => {
  const { toast } = useToast();
  const activationText = "/activate";
  const whatsappUrl = `https://wa.me/${gym.whatsapp_number}?text=${encodeURIComponent(activationText)}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(whatsappUrl);
    toast({
      title: "Copied!",
      description: "WhatsApp activation link copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-green-800">
              Gym Registered Successfully!
            </CardTitle>
            <CardDescription>
              Your gym "{gym.name}" has been registered. Follow the steps below to activate your WhatsApp bot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Activation Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click the WhatsApp button below or scan the QR code</li>
                <li>Send the message "/activate" to activate your bot</li>
                <li>Your AI assistant will be ready to help your gym members!</li>
              </ol>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-white p-8 rounded-lg border inline-block">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-sm text-gray-600">QR Code Placeholder</p>
                <p className="text-xs text-gray-500 mt-2">
                  Scan to open WhatsApp with activation message
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Activate via WhatsApp
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Access your admin dashboard to manage members and leads</li>
                <li>• Set up payment tracking and notifications</li>
                <li>• Start broadcasting messages to your community</li>
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
