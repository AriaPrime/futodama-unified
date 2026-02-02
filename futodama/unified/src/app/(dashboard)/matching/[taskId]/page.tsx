"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTaskById } from "@/lib/mock-data/tasks";
import { MatchCard, MatchDetail } from "@/components/matching";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Filter, Star, Users, Loader2 } from "lucide-react";
import type { Match } from "@/types";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default function MatchingResultsPage({ params }: PageProps) {
  const { taskId } = use(params);
  const { locale } = useLanguage();
  
  const task = getTaskById(taskId);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch(`/api/matching/${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch matches");
        const data = await response.json();
        setMatches(data.matches);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    
    fetchMatches();
  }, [taskId]);

  if (!task) {
    notFound();
  }

  const labels = locale === "da" ? {
    back: "Tilbage til matching",
    matchResults: "Match resultater",
    forTask: "for",
    filters: "Filtre",
    availability: "Tilgængelighed",
    all: "Alle",
    availableNow: "Tilgængelig nu",
    canStartSoon: "Kan starte snart",
    candidates: "kandidater",
    onShortlist: "på shortlist",
    loading: "Finder matches...",
    noMatches: "Ingen matches fundet",
    error: "Fejl ved hentning af matches",
  } : {
    back: "Back to matching",
    matchResults: "Match Results",
    forTask: "for",
    filters: "Filters",
    availability: "Availability",
    all: "All",
    availableNow: "Available now",
    canStartSoon: "Can start soon",
    candidates: "candidates",
    onShortlist: "on shortlist",
    loading: "Finding matches...",
    noMatches: "No matches found",
    error: "Error fetching matches",
  };

  const toggleShortlist = (consultantId: string) => {
    setShortlistedIds(prev => {
      const next = new Set(prev);
      if (next.has(consultantId)) {
        next.delete(consultantId);
      } else {
        next.add(consultantId);
      }
      return next;
    });
  };

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (availabilityFilter === "available") {
      return match.consultant.availability.status === "available";
    }
    if (availabilityFilter === "soon") {
      return match.consultant.availability.status === "available" || 
             match.consultant.availability.status === "partially_available";
    }
    return true;
  }).map(match => ({
    ...match,
    shortlisted: shortlistedIds.has(match.consultantId),
  }));

  const shortlistedCount = shortlistedIds.size;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/matching"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {labels.matchResults}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {task.client} — {task.title}
          </p>
        </div>
        {shortlistedCount > 0 && (
          <Badge variant="secondary" className="text-base px-4 py-2">
            <Star className="mr-2 h-4 w-4 fill-current text-amber-500" />
            {shortlistedCount} {labels.onShortlist}
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {labels.filters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{labels.availability}:</span>
            {[
              { value: "all", label: labels.all },
              { value: "available", label: labels.availableNow },
              { value: "soon", label: labels.canStartSoon },
            ].map((option) => (
              <Button
                key={option.value}
                variant={availabilityFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setAvailabilityFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{labels.loading}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{labels.error}</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : filteredMatches.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Users className="inline h-4 w-4 mr-1" />
            {filteredMatches.length} {labels.candidates}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.consultantId}
                match={match}
                onShortlist={toggleShortlist}
                onExplain={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">{labels.noMatches}</p>
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetail
          match={{
            ...selectedMatch,
            shortlisted: shortlistedIds.has(selectedMatch.consultantId),
          }}
          onClose={() => setSelectedMatch(null)}
          onShortlist={toggleShortlist}
        />
      )}
    </div>
  );
}
