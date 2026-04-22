import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ArrowLeft, Loader2, Users, Calendar, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const phqBuckets = [
  { label: "0-4 (Minimal)", min: 0, max: 4 },
  { label: "5-9 (Mild)", min: 5, max: 9 },
  { label: "10-14 (Moderate)", min: 10, max: 14 },
  { label: "15-19 (Mod-Severe)", min: 15, max: 19 },
  { label: "20-27 (Severe)", min: 20, max: 27 },
];

const Admin = () => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [phqData, setPhqData] = useState<{ name: string; count: number }[]>([]);
  const [bookingData, setBookingData] = useState<{ week: string; count: number }[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalUsers: 0, totalMoodEntries: 0 });

  useEffect(() => {
    const load = async () => {
      const [moodRes, bookingsRes, profilesRes] = await Promise.all([
        supabase.from("mood_entries").select("phq9_score, created_at"),
        supabase.from("bookings").select("created_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      // PHQ-9 distribution
      const phqCounts = phqBuckets.map((b) => ({
        name: b.label,
        count:
          moodRes.data?.filter(
            (m) => m.phq9_score !== null && m.phq9_score >= b.min && m.phq9_score <= b.max,
          ).length ?? 0,
      }));
      setPhqData(phqCounts);

      // Bookings per week (last 8 weeks)
      const weekMap = new Map<string, number>();
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        weekMap.set(key, 0);
      }
      bookingsRes.data?.forEach((b) => {
        const created = new Date(b.created_at);
        const diffWeeks = Math.floor((now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks >= 0 && diffWeeks < 8) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - diffWeeks * 7);
          const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
          weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
        }
      });
      setBookingData(Array.from(weekMap.entries()).map(([week, count]) => ({ week, count })));

      setStats({
        totalBookings: bookingsRes.data?.length ?? 0,
        totalUsers: profilesRes.count ?? 0,
        totalMoodEntries: moodRes.data?.length ?? 0,
      });

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-calm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Admin Analytics</h1>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Mood Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalMoodEntries}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>PHQ-9 Distribution</CardTitle>
            <CardDescription>Aggregated severity buckets across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={phqData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Bookings Per Week</CardTitle>
            <CardDescription>Last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
