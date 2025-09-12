import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const counselors = [
  { id: "dr-meera", name: "Dr. Meera Sharma", specialization: "Anxiety & Depression", available: "Mon-Fri 9AM-5PM" },
  { id: "dr-raj", name: "Dr. Raj Kumar", specialization: "Student Stress Management", available: "Tue-Sat 10AM-6PM" },
  { id: "dr-priya", name: "Dr. Priya Singh", specialization: "Trauma Counseling", available: "Mon-Thu 11AM-7PM" },
  { id: "helpline", name: "24/7 Crisis Helpline", specialization: "Emergency Support", available: "Always Available" },
];

export const BookingForm = () => {
  const [formData, setFormData] = useState({
    counselor: "",
    date: "",
    time: "",
    reason: "",
    urgency: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.counselor || !formData.date || !formData.time) {
      toast({
        title: "Please fill required fields",
        description: "Counselor, date, and time are required.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking Confirmed! 🌟",
      description: "Your counseling session has been scheduled. You'll receive a confirmation email shortly.",
    });

    // Reset form
    setFormData({
      counselor: "",
      date: "",
      time: "",
      reason: "",
      urgency: "",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Book Confidential Counseling
        </CardTitle>
        <CardDescription>
          All sessions are completely confidential and secure. Your privacy is our priority.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="counselor" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Select Counselor *
            </Label>
            <Select value={formData.counselor} onValueChange={(value) => setFormData({...formData, counselor: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a counselor..." />
              </SelectTrigger>
              <SelectContent>
                {counselors.map((counselor) => (
                  <SelectItem key={counselor.id} value={counselor.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{counselor.name}</span>
                      <span className="text-sm text-muted-foreground">{counselor.specialization}</span>
                      <span className="text-xs text-muted-foreground">{counselor.available}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Preferred Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Time *
              </Label>
              <Select value={formData.time} onValueChange={(value) => setFormData({...formData, time: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 9).map((hour) => (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00 {hour < 12 ? 'AM' : 'PM'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
              <SelectTrigger>
                <SelectValue placeholder="How urgent is this?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General consultation</SelectItem>
                <SelectItem value="medium">Medium - Ongoing concerns</SelectItem>
                <SelectItem value="high">High - Need support soon</SelectItem>
                <SelectItem value="crisis">Crisis - Immediate help needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">What brings you here today? (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Share what you'd like to discuss... (This helps us prepare better for our session)"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="min-h-[100px]"
            />
          </div>

          <div className="bg-primary-soft p-4 rounded-lg">
            <p className="text-sm text-primary">
              <Shield className="h-4 w-4 inline mr-2" />
              Your information is completely confidential and protected under healthcare privacy laws.
            </p>
          </div>

          <Button type="submit" variant="wellness" size="lg" className="w-full">
            Schedule Session
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};