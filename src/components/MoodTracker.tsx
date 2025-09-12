import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Smile, Meh, Frown, Cloud } from "lucide-react";

const moods = [
  { icon: Smile, label: "Great", value: "great", color: "text-green-500" },
  { icon: Heart, label: "Good", value: "good", color: "text-blue-500" },
  { icon: Meh, label: "Okay", value: "okay", color: "text-yellow-500" },
  { icon: Frown, label: "Low", value: "low", color: "text-orange-500" },
  { icon: Cloud, label: "Struggling", value: "struggling", color: "text-gray-500" },
];

export const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <Card className="bg-gradient-calm border-0 shadow-card">
      <CardHeader>
        <CardTitle className="text-center text-foreground">How are you feeling today?</CardTitle>
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