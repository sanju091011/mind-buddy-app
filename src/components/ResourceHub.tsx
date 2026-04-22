import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, Headphones, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Resource = {
  id: string;
  title: string;
  type: string;
  link: string;
  language: string | null;
  description: string | null;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Play className="h-4 w-4" />;
    case "audio":
      return <Headphones className="h-4 w-4" />;
    case "pdf":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const ResourceHub = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("resources")
        .select("id, title, type, link, language, description")
        .order("created_at", { ascending: false });
      setResources(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredResources = resources.filter((resource) => {
    const typeMatch = filter === "all" || resource.type === filter;
    const languageMatch = languageFilter === "all" || resource.language === languageFilter;
    return typeMatch && languageMatch;
  });

  const languages = Array.from(new Set(resources.map((r) => r.language).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Type:</span>
          {["all", "video", "audio", "pdf", "article"].map((type) => (
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

        {languages.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Language:</span>
            {["all", ...languages].map((lang) => (
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
        )}
      </div>

      {filteredResources.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No resources match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-soft transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <Badge variant="secondary">{resource.type}</Badge>
                  </div>
                  {resource.language && <Badge variant="outline">{resource.language}</Badge>}
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                {resource.description && <CardDescription>{resource.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <Button
                  variant="wellness"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    Open Resource
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
