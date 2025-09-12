import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Heart, Phone } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const predefinedResponses = {
  "anxiety": "I understand you're feeling anxious. Here are some quick techniques that can help:\n\n🌬️ Try the 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8\n📱 Consider booking a session with our counselors\n🎵 Listen to our calming audio resources",
  "stress": "Stress is very common among students. Let's work through this together:\n\n✅ Break large tasks into smaller ones\n🧘 Try a 5-minute meditation\n💤 Ensure you're getting enough sleep\n🤝 Consider talking to a counselor",
  "depression": "Thank you for sharing this with me. Your feelings are valid:\n\n💚 Remember that you're not alone\n📞 Our crisis helpline is available 24/7\n👥 Consider booking with Dr. Meera, our depression specialist\n🚨 If you're having thoughts of self-harm, please call emergency services immediately",
  "help": "I'm here to support you! Here's how I can help:\n\n🎯 Mood tracking and wellness tips\n📚 Mental health resources\n👩‍⚕️ Connect you with counselors\n📞 Crisis support information\n\nWhat would you like to explore?",
  "default": "I hear you. Mental health is important, and I'm glad you're reaching out. Can you tell me more about what you're experiencing? I can help with anxiety, stress, depression, or general support."
};

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm MindMate AI. I'm here to provide mental health support and guidance. How are you feeling today? 💚",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const detectIntent = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("anxious") || lowerText.includes("anxiety") || lowerText.includes("worried")) {
      return "anxiety";
    }
    if (lowerText.includes("stress") || lowerText.includes("overwhelmed") || lowerText.includes("pressure")) {
      return "stress";
    }
    if (lowerText.includes("depress") || lowerText.includes("sad") || lowerText.includes("hopeless") || lowerText.includes("empty")) {
      return "depression";
    }
    if (lowerText.includes("help") || lowerText.includes("support") || lowerText.includes("what can you do")) {
      return "help";
    }
    return "default";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Generate bot response
    const intent = detectIntent(input);
    const response = predefinedResponses[intent as keyof typeof predefinedResponses];

    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-card">
      <CardHeader className="bg-gradient-wellness text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          MindMate AI Support
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2 mb-3">
            <Button
              variant="calm"
              size="sm"
              onClick={() => setInput("I'm feeling anxious")}
            >
              😰 Anxious
            </Button>
            <Button
              variant="calm"
              size="sm"
              onClick={() => setInput("I'm stressed about studies")}
            >
              📚 Stressed
            </Button>
            <Button
              variant="calm"
              size="sm"
              onClick={() => setInput("I need help")}
            >
              🆘 Need Help
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSend} variant="wellness" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Crisis: 1800-599-0019
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              You're not alone
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};