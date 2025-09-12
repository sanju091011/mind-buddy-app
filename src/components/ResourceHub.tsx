import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, Headphones, Filter } from "lucide-react";

const resources = [
  {
    id: 1,
    title: "Breathing Exercises for Anxiety",
    type: "video",
    language: "English",
    description: "Learn simple breathing techniques to manage anxiety",
    duration: "5 min",
    category: "Stress Relief"
  },
  {
    id: 2,
    title: "Guided Meditation - Hindi",
    type: "audio",
    language: "Hindi",
    description: "शांति और मानसिक स्वास्थ्य के लिए निर्देशित ध्यान",
    duration: "10 min",
    category: "Meditation"
  },
  {
    id: 3,
    title: "Student Mental Health Guide",
    type: "pdf",
    language: "English",
    description: "Comprehensive guide for maintaining mental wellness in college",
    duration: "15 min read",
    category: "Education"
  },
  {
    id: 4,
    title: "Sleep Hygiene Tips",
    type: "video",
    language: "Telugu",
    description: "నిద్రలేమి మరియు మంచి నిద్రకు సహాయపడే చిట్కాలు",
    duration: "8 min",
    category: "Sleep"
  },
  {
    id: 5,
    title: "Progressive Muscle Relaxation",
    type: "audio",
    language: "English",
    description: "Release tension with guided muscle relaxation",
    duration: "12 min",
    category: "Relaxation"
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video": return <Play className="h-4 w-4" />;
    case "audio": return <Headphones className="h-4 w-4" />;
    case "pdf": return <FileText className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

export const ResourceHub = () => {
  const [filter, setFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  const filteredResources = resources.filter(resource => {
    const typeMatch = filter === "all" || resource.type === filter;
    const languageMatch = languageFilter === "all" || resource.language === languageFilter;
    return typeMatch && languageMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Type:</span>
          {["all", "video", "audio", "pdf"].map((type) => (
            <Button
              key={type}
              variant={filter === type ? "wellness" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Language:</span>
          {["all", "English", "Hindi", "Telugu"].map((lang) => (
            <Button
              key={lang}
              variant={languageFilter === lang ? "mood" : "outline"}
              size="sm"
              onClick={() => setLanguageFilter(lang)}
            >
              {lang === "all" ? "All" : lang}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(resource.type)}
                  <Badge variant="secondary">{resource.type}</Badge>
                </div>
                <Badge variant="outline">{resource.language}</Badge>
              </div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{resource.duration}</p>
                  <Badge className="bg-primary-soft text-primary">{resource.category}</Badge>
                </div>
                <Button variant="wellness" size="sm">
                  Access
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};