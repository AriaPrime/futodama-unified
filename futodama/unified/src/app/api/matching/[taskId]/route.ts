import { NextRequest, NextResponse } from "next/server";
import { getTaskById } from "@/lib/mock-data/tasks";
import { consultants } from "@/lib/mock-data/consultants";
import type { Match, MatchReasoning } from "@/types";
import type { Consultant, Task, TaskRequirement } from "@/types";

// Simple matching algorithm - scores consultants against task requirements
function calculateMatch(consultant: Consultant, task: Task): Match {
  let score = 50; // Base score
  const strengths: string[] = [];
  const gaps: string[] = [];

  const consultantSkills = consultant.cv.skills.map(s => s.name.toLowerCase());
  const consultantSkillsExpert = consultant.cv.skills
    .filter(s => s.level === "expert")
    .map(s => s.name.toLowerCase());

  // Check each requirement
  for (const req of task.requirements) {
    const reqValue = req.value.toLowerCase();
    
    if (req.type === "skill") {
      const hasSkill = consultantSkills.some(s => 
        s.includes(reqValue) || reqValue.includes(s)
      );
      const isExpert = consultantSkillsExpert.some(s => 
        s.includes(reqValue) || reqValue.includes(s)
      );

      if (hasSkill) {
        if (req.priority === "required") {
          score += isExpert ? 15 : 10;
          if (isExpert) {
            strengths.push(`Expert level ${req.value}`);
          } else {
            strengths.push(`Has ${req.value} experience`);
          }
        } else if (req.priority === "preferred") {
          score += isExpert ? 8 : 5;
          strengths.push(`${req.value} (preferred)`);
        } else {
          score += 3;
        }
      } else if (req.priority === "required") {
        score -= 15;
        gaps.push(`Missing required skill: ${req.value}`);
      } else if (req.priority === "preferred") {
        score -= 5;
        gaps.push(`Missing preferred: ${req.value}`);
      }
    }

    if (req.type === "experience") {
      // Check years of experience
      const yearsMatch = req.value.match(/(\d+)\+?\s*(år|years?)/i);
      if (yearsMatch) {
        const requiredYears = parseInt(yearsMatch[1]);
        const consultantYears = consultant.cv.experience.reduce((acc, exp) => {
          const start = new Date(exp.startDate);
          const end = exp.endDate ? new Date(exp.endDate) : new Date();
          return acc + (end.getFullYear() - start.getFullYear());
        }, 0);

        if (consultantYears >= requiredYears) {
          score += 10;
          strengths.push(`${consultantYears}+ years of experience`);
        } else {
          score -= 10;
          gaps.push(`Only ${consultantYears} years experience (needs ${requiredYears}+)`);
        }
      }
    }

    if (req.type === "location") {
      const consultantLocation = consultant.location.toLowerCase();
      const reqLocation = req.value.toLowerCase();
      if (consultantLocation.includes("københavn") && reqLocation.includes("københavn")) {
        score += 5;
        strengths.push("Based in Copenhagen area");
      } else if (reqLocation.includes("hybrid") || reqLocation.includes("remote")) {
        score += 3;
      }
    }
  }

  // Availability bonus
  if (consultant.availability.status === "available") {
    score += 10;
    strengths.push("Available immediately");
  } else if (consultant.availability.status === "partially_available") {
    score += 5;
    strengths.push(`Available from ${consultant.availability.date}`);
  } else {
    score -= 10;
    gaps.push("Currently unavailable");
  }

  // CV Health bonus
  if (consultant.cvHealthScore >= 90) {
    score += 5;
    strengths.push("Excellent CV quality");
  } else if (consultant.cvHealthScore < 70) {
    score -= 5;
    gaps.push("CV needs updating");
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Generate overall fit description
  let overallFit: string;
  if (score >= 85) {
    overallFit = "Excellent match with strong alignment on all key requirements.";
  } else if (score >= 70) {
    overallFit = "Good match with relevant experience. Minor gaps can be quickly addressed.";
  } else if (score >= 50) {
    overallFit = "Potential match with transferable skills. Some training may be needed.";
  } else {
    overallFit = "Limited match. Significant gaps in required competencies.";
  }

  const reasoning: MatchReasoning = {
    strengths: strengths.slice(0, 5),
    gaps: gaps.slice(0, 3),
    overallFit,
  };

  return {
    consultantId: consultant.id,
    consultant,
    taskId: task.id,
    score,
    reasoning,
    shortlisted: false,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  
  const task = getTaskById(taskId);
  if (!task) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  // Calculate matches for all consultants
  const matches = consultants
    .map(consultant => calculateMatch(consultant, task))
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({
    taskId,
    task,
    matches,
    totalMatches: matches.length,
    topScore: matches[0]?.score || 0,
  });
}
