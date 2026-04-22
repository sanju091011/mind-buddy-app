import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Smile, Meh, Frown, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const moods = [
  { icon: Smile, label: "Great", value: 5, color: "text-green-500" },
  { icon: Heart, label: "Good", value: 4, color: "text-blue-500" },
  { icon: Meh, label: "Okay", value: 3, color: "text-yellow-500" },
  { icon: Frown, label: "Low", value: 2, color: "text-orange-500" },
  { icon: Cloud, label: "Struggling", value: 1, color: "text-gray-500" },
];

export const MoodTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    const fetchToday = async () => {
      if (!user) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("mood_entries")
        .select("mood_score")
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setSelectedMood(data.mood_score);
        setTodayLogged(true);
      }
    };
    fetchToday();
  }, [user]);

  const handleMoodSelect = async (mood: number) => {
    if (!user) return;
    setSelectedMood(mood);
    const { error } = await supabase.from("mood_entries").insert({
      user_id: user.id,
      mood_score: mood,
    });
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setTodayLogged(true);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <Card className="bg-gradient-calm border-0 shadow-card">
      <CardHeader>
        <CardTitle className="text-center text-foreground">
          {todayLogged ? "How's your mood now?" : "How are you feeling today?"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-5 gap-3">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? "mood" : "calm"}
                size="lg"
                className="h-16 flex-col gap-2"
                onClick={() => handleMoodSelect(mood.value)}
              >
                <Icon className={`h-6 w-6 ${mood.color}`} />
                <span className="text-xs">{mood.label}</span>
              </Button>
            );
          })}
        </div>

        {showMessage && selectedMood && (
          <div className="text-center p-4 bg-primary-soft rounded-lg animate-glow">
            <p className="text-primary font-medium">
              Thanks for sharing! Remember, every feeling is valid. 💚
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
