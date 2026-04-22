import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Heart, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  created_at: string;
}

const predefinedResponses = {
  anxiety:
    "I understand you're feeling anxious. Here are some quick techniques that can help:\n\n🌬️ Try the 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8\n📱 Consider booking a session with our counselors\n🎵 Listen to our calming audio resources",
  stress:
    "Stress is very common among students. Let's work through this together:\n\n✅ Break large tasks into smaller ones\n🧘 Try a 5-minute meditation\n💤 Ensure you're getting enough sleep\n🤝 Consider talking to a counselor",
  depression:
    "Thank you for sharing this with me. Your feelings are valid:\n\n💚 Remember that you're not alone\n📞 Our crisis helpline is available 24/7\n👥 Consider booking with Dr. Meera, our depression specialist\n🚨 If you're having thoughts of self-harm, please call emergency services immediately",
  help: "I'm here to support you! Here's how I can help:\n\n🎯 Mood tracking and wellness tips\n📚 Mental health resources\n👩‍⚕️ Connect you with counselors\n📞 Crisis support information\n\nWhat would you like to explore?",
  default:
    "I hear you. Mental health is important, and I'm glad you're reaching out. Can you tell me more about what you're experiencing? I can help with anxiety, stress, depression, or general support.",
};

const detectIntent = (text: string): keyof typeof predefinedResponses => {
  const t = text.toLowerCase();
  if (/(anxious|anxiety|worried)/.test(t)) return "anxiety";
  if (/(stress|overwhelmed|pressure)/.test(t)) return "stress";
  if (/(depress|sad|hopeless|empty)/.test(t)) return "depression";
  if (/(help|support|what can you do)/.test(t)) return "help";
  return "default";
};

const GREETING: Message = {
  id: "greeting",
  content:
    "Hi! I'm MindMate AI. I'm here to provide mental health support and guidance. How are you feeling today? 💚",
  sender: "ai",
  created_at: new Date().toISOString(),
};

export const ChatBot = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Create or load a session for this user
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const init = async () => {
      // Reuse most recent session, or create one
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let sid = existing?.id;
      if (!sid) {
        const { data: created, error } = await supabase
          .from("chat_sessions")
          .insert({ user_id: user.id, is_anonymous: false })
          .select("id")
          .single();
        if (error) {
          toast({ title: "Could not start chat", description: error.message, variant: "destructive" });
          return;
        }
        sid = created.id;
      }

      if (cancelled) return;
      setSessionId(sid);

      const { data: history } = await supabase
        .from("messages")
        .select("id, content, sender, created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: true });

      if (history && history.length > 0) {
        setMessages(history as Message[]);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;
    setSending(true);
    setInput("");

    const { error: userErr } = await supabase
      .from("messages")
      .insert({ session_id: sessionId, sender: "user", content: text });
    if (userErr) {
      toast({ title: "Message failed", description: userErr.message, variant: "destructive" });
      setSending(false);
      return;
    }

    const reply = predefinedResponses[detectIntent(text)];
    setTimeout(async () => {
      await supabase
        .from("messages")
        .insert({ session_id: sessionId, sender: "ai", content: reply });
      setSending(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
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
        <ScrollArea className="flex-1 p-4" ref={scrollRef as never}>
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
                  <p className="whitespace-pre-line">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button variant="calm" size="sm" onClick={() => setInput("I'm feeling anxious")}>
              😰 Anxious
            </Button>
            <Button variant="calm" size="sm" onClick={() => setInput("I'm stressed about studies")}>
              📚 Stressed
            </Button>
            <Button variant="calm" size="sm" onClick={() => setInput("I need help")}>
              🆘 Need Help
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={sessionId ? "Type your message..." : "Connecting…"}
              className="flex-1"
              disabled={!sessionId || sending}
            />
            <Button onClick={handleSend} variant="wellness" size="icon" disabled={!sessionId || sending}>
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
