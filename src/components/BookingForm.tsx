import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const counselors = [
  { id: "Dr. Meera Sharma", name: "Dr. Meera Sharma", specialization: "Anxiety & Depression", available: "Mon-Fri 9AM-5PM" },
  { id: "Dr. Raj Kumar", name: "Dr. Raj Kumar", specialization: "Student Stress Management", available: "Tue-Sat 10AM-6PM" },
  { id: "Dr. Priya Singh", name: "Dr. Priya Singh", specialization: "Trauma Counseling", available: "Mon-Thu 11AM-7PM" },
  { id: "24/7 Crisis Helpline", name: "24/7 Crisis Helpline", specialization: "Emergency Support", available: "Always Available" },
];

const bookingSchema = z.object({
  counselor: z.string().min(1, "Counselor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().max(2000).optional(),
  urgency: z.string().max(20).optional(),
});

export const BookingForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    counselor: "",
    date: "",
    time: "",
    reason: "",
    urgency: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = bookingSchema.safeParse(formData);
    if (!parsed.success) {
      toast({
        title: "Please fill required fields",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    const slotAt = new Date(`${formData.date}T${formData.time}:00`);
    if (isNaN(slotAt.getTime()) || slotAt < new Date()) {
      toast({ title: "Invalid date/time", description: "Please select a future slot.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      counsellor_name: formData.counselor,
      slot_at: slotAt.toISOString(),
      status: "pending",
      notes: formData.reason ? `[${formData.urgency || "low"}] ${formData.reason}` : formData.urgency || null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Booking Confirmed! 🌟",
      description: "Your counseling session has been scheduled.",
    });

    setFormData({ counselor: "", date: "", time: "", reason: "", urgency: "" });
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
            <Select value={formData.counselor} onValueChange={(value) => setFormData({ ...formData, counselor: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a counselor..." />
              </SelectTrigger>
              <SelectContent>
                {counselors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-sm text-muted-foreground">{c.specialization}</span>
                      <span className="text-xs text-muted-foreground">{c.available}</span>
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
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Time *
              </Label>
              <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 9).map((hour) => (
                    <SelectItem key={hour} value={`${String(hour).padStart(2, "0")}:00`}>
                      {hour}:00 {hour < 12 ? "AM" : "PM"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
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
              placeholder="Share what you'd like to discuss..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="min-h-[100px]"
              maxLength={2000}
            />
          </div>

          <div className="bg-primary-soft p-4 rounded-lg">
            <p className="text-sm text-primary">
              <Shield className="h-4 w-4 inline mr-2" />
              Your information is completely confidential and protected by row-level security.
            </p>
          </div>

          <Button type="submit" variant="wellness" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
