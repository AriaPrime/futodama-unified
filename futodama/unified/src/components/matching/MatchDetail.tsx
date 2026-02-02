"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Match } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, User, Star, X } from "lucide-react";

interface MatchDetailProps {
  match: Match;
  onClose: () => void;
  onShortlist?: (consultantId: string) => void;
}

export function MatchDetail({ match, onClose, onShortlist }: MatchDetailProps) {
  const { locale } = useLanguage();
  const { consultant, score, reasoning, shortlisted } = match;

  const labels = locale === "da" ? {
    matchExplanation: "Match forklaring",
    whyMatches: `Hvorfor ${consultant.name} matcher denne opgave`,
    overallAssessment: "Samlet vurdering",
    strengths: "Styrker",
    potentialGaps: "Potentielle gaps",
    viewProfile: "Se fuld profil",
    addToShortlist: "Tilføj til shortlist",
    removeFromShortlist: "Fjern fra shortlist",
  } : {
    matchExplanation: "Match Explanation",
    whyMatches: `Why ${consultant.name} matches this task`,
    overallAssessment: "Overall Assessment",
    strengths: "Strengths",
    potentialGaps: "Potential Gaps",
    viewProfile: "View full profile",
    addToShortlist: "Add to shortlist",
    removeFromShortlist: "Remove from shortlist",
  };

  const scoreColor = score >= 85 
    ? "text-green-600"
    : score >= 70
      ? "text-amber-600"
      : "text-gray-600";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {labels.matchExplanation}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {labels.whyMatches}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Consultant Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image
                  src={consultant.photo}
                  alt={consultant.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{consultant.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{consultant.title}</p>
              </div>
              <div className={`text-3xl font-bold ${scoreColor}`}>
                {score}%
              </div>
            </div>

            {/* Overall Assessment */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{labels.overallAssessment}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{reasoning.overallFit}</p>
              </CardContent>
            </Card>

            {/* Strengths */}
            {reasoning.strengths.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    {labels.strengths}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reasoning.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-green-600 mt-1">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Gaps */}
            {reasoning.gaps.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    {labels.potentialGaps}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reasoning.gaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-amber-600 mt-1">!</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button variant="outline" asChild>
              <Link href={`/consultants/${consultant.id}`}>
                <User className="mr-2 h-4 w-4" />
                {labels.viewProfile}
              </Link>
            </Button>
            <Button
              variant={shortlisted ? "outline" : "default"}
              onClick={() => onShortlist?.(consultant.id)}
            >
              <Star className={`mr-2 h-4 w-4 ${shortlisted ? "fill-current" : ""}`} />
              {shortlisted ? labels.removeFromShortlist : labels.addToShortlist}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
