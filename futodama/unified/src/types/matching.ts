// Matching Types

import type { Consultant } from './consultant';

export interface Match {
  consultantId: string;
  consultant: Consultant;
  taskId: string;
  score: number;
  reasoning: MatchReasoning;
  shortlisted: boolean;
}

export interface MatchReasoning {
  strengths: string[];
  gaps: string[];
  overallFit: string;
}
