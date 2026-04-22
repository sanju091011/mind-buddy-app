import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoodTracker } from "./MoodTracker";
import { ResourceHub } from "./ResourceHub";
import { BookingForm } from "./BookingForm";
import { ChatBot } from "./ChatBot";
import { ProfileTab } from "./ProfileTab";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MessageCircle, BookOpen, User, Activity, Phone, Shield, BarChart3 } from "lucide-react";
import heroImage from "@/assets/hero-wellness.jpg";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-wellness rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">MindMate</h1>
              <span className="text-sm text-muted-foreground bg-primary-soft px-2 py-1 rounded">
                Student Mental Health Hub
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Phone className="h-4 w-4 mr-2" />
                Crisis: 1800-599-0019
              </Button>
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="calm" size="sm" onClick={() => setActiveTab("profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Book Session</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Hero Section */}
            <Card className="border-0 bg-gradient-wellness text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-20">
                <img 
                  src={heroImage} 
                  alt="Peaceful wellness illustration" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="relative p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Welcome to Your Mental Wellness Journey</h2>
                <p className="text-white/90 mb-6 text-lg">
                  Take care of your mind, track your mood, and get support when you need it
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-primary"
                    onClick={() => setActiveTab("chat")}
                  >
                    Talk to AI Support
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-primary"
                    onClick={() => setActiveTab("booking")}
                  >
                    Book Counseling
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mood Tracker */}
            <MoodTracker />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Wellness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">85%</div>
                  <p className="text-sm text-muted-foreground">Great progress this week!</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Next Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-foreground mb-2">Tomorrow, 3 PM</div>
                  <p className="text-sm text-muted-foreground">Dr. Meera Sharma</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Safe Space
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-foreground mb-2">Always Available</div>
                  <p className="text-sm text-muted-foreground">Confidential & secure</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access key features with one click</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="calm" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageCircle className="h-6 w-6" />
                  AI Support
                </Button>
                <Button 
                  variant="calm" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("resources")}
                >
                  <BookOpen className="h-6 w-6" />
                  Resources
                </Button>
                <Button 
                  variant="calm" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("booking")}
                >
                  <Calendar className="h-6 w-6" />
                  Book Session
                </Button>
                <Button variant="mood" className="h-20 flex-col gap-2">
                  <Phone className="h-6 w-6" />
                  Crisis Line
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <div className="max-w-4xl mx-auto">
              <ChatBot />
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">Mental Health Resources</h2>
                <p className="text-muted-foreground text-lg">
                  Curated content to support your mental wellness journey
                </p>
              </div>
              <ResourceHub />
            </div>
          </TabsContent>

          <TabsContent value="booking">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">Book Counseling Session</h2>
                <p className="text-muted-foreground text-lg">
                  Connect with professional counselors in a safe, confidential environment
                </p>
              </div>
              <BookingForm />
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};