
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dumbbell, Users, MessageSquare, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Gym AI WhatsApp Bot
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your gym business with AI-powered WhatsApp automation. 
            Manage members, track leads, and grow your fitness community effortlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Dumbbell className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Gym Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete gym onboarding and QR code activation system
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Member Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track members, leads, and payment statuses in real-time
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>WhatsApp Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered WhatsApp bot for automated member engagement
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive dashboard with insights and analytics
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center space-x-6">
          <Link to="/gym-signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Register Your Gym
            </Button>
          </Link>
          <Link to="/admin-login">
            <Button size="lg" variant="outline">
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
