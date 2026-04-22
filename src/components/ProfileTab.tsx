import { useEffect, useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  college: z.string().trim().max(150).optional().or(z.literal("")),
  preferred_language: z.string().trim().max(50).optional().or(z.literal("")),
});

export const ProfileTab = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, college, preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setName(data.name ?? "");
        setCollege(data.college ?? "");
        setLanguage(data.preferred_language ?? "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const parsed = profileSchema.safeParse({ name, college, preferred_language: language });
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: parsed.data.name,
        college: parsed.data.college || null,
        preferred_language: parsed.data.preferred_language || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Your Profile
        </CardTitle>
        <CardDescription>
          Manage your information. {isAdmin && <span className="text-primary font-medium">You are an admin.</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-college">College</Label>
            <Input id="profile-college" value={college} onChange={(e) => setCollege(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-language">Preferred Language</Label>
            <Input id="profile-language" value={language} onChange={(e) => setLanguage(e.target.value)} />
          </div>
        </div>

        <div className="bg-primary-soft p-4 rounded-lg">
          <h3 className="font-medium text-primary mb-2">Privacy & Security</h3>
          <p className="text-sm text-primary">
            Your data is private. Row-level security ensures only you (and admins, for analytics) can see your
            records.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="wellness" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Profile"}
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
