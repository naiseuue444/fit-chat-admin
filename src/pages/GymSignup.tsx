
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const GymSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    phone_number: "",
    address: "",
    membership_plans: "",
    offers: "",
    class_schedule: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedGym, setSubmittedGym] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("gyms")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      // Create admin entry for the gym owner
      await supabase
        .from("admins")
        .insert([{
          gym_id: data.gym_id,
          number: formData.phone_number
        }]);

      setSubmittedGym(data);
      toast({
        title: "Gym registered successfully!",
        description: "Your gym has been registered. Share the QR code to activate your WhatsApp bot.",
      });
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submittedGym) {
    return <QRCodeDisplay gym={submittedGym} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Register Your Gym</CardTitle>
            <CardDescription className="text-center">
              Complete the form below to get your AI WhatsApp bot activated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Gym Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone_number">WhatsApp Number *</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Gym Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="membership_plans">Membership Plans</Label>
                <Textarea
                  id="membership_plans"
                  name="membership_plans"
                  value={formData.membership_plans}
                  onChange={handleInputChange}
                  placeholder="Monthly: $50, Yearly: $500..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="offers">Current Offers</Label>
                <Textarea
                  id="offers"
                  name="offers"
                  value={formData.offers}
                  onChange={handleInputChange}
                  placeholder="First month free, Student discount..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="class_schedule">Class Schedule</Label>
                <Textarea
                  id="class_schedule"
                  name="class_schedule"
                  value={formData.class_schedule}
                  onChange={handleInputChange}
                  placeholder="Monday: Yoga 6AM-7AM, CrossFit 7PM-8PM..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Registering..." : "Register Gym"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GymSignup;
