"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Match } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, AlertTriangle, User, Clock } from "lucide-react";

interface MatchCardProps {
  match: Match;
  onShortlist?: (consultantId: string) => void;
  onExplain?: (match: Match) => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : score >= 70
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

  return (
    <div className={`px-3 py-1 rounded-lg font-bold text-lg ${color}`}>
      {score}%
    </div>
  );
}

export function MatchCard({ match, onShortlist, onExplain }: MatchCardProps) {
  const { locale } = useLanguage();
  const { consultant, score, reasoning, shortlisted } = match;

  const labels = locale === "da" ? {
    matchScore: "Match score",
    strengths: "Styrker",
    gaps: "Gaps",
    viewProfile: "Se profil",
    shortlist: "Shortlist",
    onShortlist: "På shortlist",
    explain: "Forklar match",
    available: "Tilgængelig",
    partiallyAvailable: "Delvis tilgængelig",
    unavailable: "Optaget",
  } : {
    matchScore: "Match score",
    strengths: "Strengths",
    gaps: "Gaps",
    viewProfile: "View profile",
    shortlist: "Shortlist",
    onShortlist: "On shortlist",
    explain: "Explain match",
    available: "Available",
    partiallyAvailable: "Partially available",
    unavailable: "Unavailable",
  };

  const availabilityLabel = consultant.availability.status === "available"
    ? labels.available
    : consultant.availability.status === "partially_available"
      ? labels.partiallyAvailable
      : labels.unavailable;

  const availabilityColor = consultant.availability.status === "available"
    ? "text-green-600"
    : consultant.availability.status === "partially_available"
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 ${
      shortlisted 
        ? "border-green-300 dark:border-green-700 ring-2 ring-green-100 dark:ring-green-900/30"
        : "border-gray-200 dark:border-gray-700"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
          <Image
            src={consultant.photo}
            alt={consultant.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">{consultant.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{consultant.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className={`h-3.5 w-3.5 ${availabilityColor}`} />
            <span className={`text-xs ${availabilityColor}`}>{availabilityLabel}</span>
          </div>
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* Strengths */}
      {reasoning.strengths.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 mb-1.5">
            <CheckCircle className="h-4 w-4" />
            {labels.strengths}
          </div>
          <ul className="space-y-1">
            {reasoning.strengths.slice(0, 3).map((strength, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-5">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {reasoning.gaps.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 mb-1.5">
            <AlertTriangle className="h-4 w-4" />
            {labels.gaps}
          </div>
          <ul className="space-y-1">
            {reasoning.gaps.slice(0, 2).map((gap, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-5">
                • {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/consultants/${consultant.id}`}>
            <User className="mr-1.5 h-4 w-4" />
            {labels.viewProfile}
          </Link>
        </Button>
        <Button
          variant={shortlisted ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => onShortlist?.(consultant.id)}
        >
          <Star className={`mr-1.5 h-4 w-4 ${shortlisted ? "fill-current" : ""}`} />
          {shortlisted ? labels.onShortlist : labels.shortlist}
        </Button>
      </div>
    </div>
  );
}
