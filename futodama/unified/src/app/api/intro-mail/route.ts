import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consultants } from "@/lib/mock-data/consultants";
import { getTaskById } from "@/lib/mock-data/tasks";
import type { Consultant, Task } from "@/types";

const anthropic = new Anthropic();

interface IntroMailRequest {
  consultantIds: string[];
  taskId: string;
  recipientName?: string;
  recipientCompany?: string;
  language?: "en" | "da";
  tone?: "formal" | "friendly" | "persuasive";
}

interface GeneratedIntroMail {
  subject: string;
  body: string;
  consultantSummaries: {
    consultantId: string;
    name: string;
    highlight: string;
  }[];
}

function buildConsultantContext(consultant: Consultant): string {
  const skills = consultant.cv.skills
    .filter(s => s.level === "expert" || s.level === "very_experienced")
    .map(s => s.name)
    .slice(0, 10)
    .join(", ");

  const recentExperience = consultant.cv.experience
    .slice(0, 3)
    .map(exp => `${exp.role} at ${exp.company} (${exp.project})`)
    .join("; ");

  return `
Name: ${consultant.name}
Title: ${consultant.title}
Key Skills: ${skills}
Recent Experience: ${recentExperience}
Availability: ${consultant.availability.status === "available" ? "Available immediately" : consultant.availability.status === "partially_available" ? `Available from ${consultant.availability.date}` : "Currently engaged"}
Location: ${consultant.location}
`;
}

function buildTaskContext(task: Task): string {
  const requirements = task.requirements
    .map(r => `${r.type}: ${r.value} (${r.priority})`)
    .join("; ");

  return `
Title: ${task.title}
Client: ${task.client}
Description: ${task.description}
Requirements: ${requirements}
Deadline: ${task.deadline}
`;
}

export async function POST(request: NextRequest) {
  try {
    const body: IntroMailRequest = await request.json();
    const { consultantIds, taskId, recipientName, recipientCompany, language = "en", tone = "friendly" } = body;

    // Validate inputs
    if (!consultantIds || consultantIds.length === 0) {
      return NextResponse.json(
        { error: "At least one consultant must be selected" },
        { status: 400 }
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Get consultants and task
    const selectedConsultants = consultantIds
      .map(id => consultants.find(c => c.id === id))
      .filter((c): c is Consultant => c !== undefined);

    if (selectedConsultants.length === 0) {
      return NextResponse.json(
        { error: "No valid consultants found" },
        { status: 404 }
      );
    }

    const task = getTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Build context for AI
    const consultantContexts = selectedConsultants
      .map(c => buildConsultantContext(c))
      .join("\n---\n");

    const taskContext = buildTaskContext(task);

    const toneGuidance = {
      formal: "Use professional, formal language suitable for enterprise clients. Be respectful and thorough.",
      friendly: "Use warm, approachable language while remaining professional. Be conversational but competent.",
      persuasive: "Emphasize value proposition and unique strengths. Create urgency where appropriate.",
    };

    const languageGuidance = language === "da" 
      ? "Write the email in Danish. Use professional Danish business communication style."
      : "Write the email in English. Use professional business communication style.";

    const prompt = `You are an expert consultant sales professional writing an introduction email to propose consultant candidates for a client project.

## Task/Project Context
${taskContext}

## Consultant Candidates
${consultantContexts}

## Recipient
${recipientName ? `Name: ${recipientName}` : "Name: [Client Contact]"}
${recipientCompany ? `Company: ${recipientCompany}` : `Company: ${task.client}`}

## Instructions
${languageGuidance}
${toneGuidance[tone]}

Create a compelling introduction email that:
1. Opens with a brief, relevant hook related to the project/client needs
2. Introduces each consultant with a 1-2 sentence highlight of why they're a great fit
3. Emphasizes relevant experience and skills that match the requirements
4. Includes a clear call to action (schedule a call, review CVs, etc.)
5. Keeps the total length reasonable (300-500 words)

Respond in JSON format:
{
  "subject": "Email subject line (compelling, specific to the opportunity)",
  "body": "Full email body with proper formatting (use \\n for line breaks)",
  "consultantSummaries": [
    {
      "consultantId": "consultant id",
      "name": "consultant name",
      "highlight": "1-2 sentence highlight of why they're perfect for this role"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content
    const textContent = message.content.find(block => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse the JSON response
    let generatedMail: GeneratedIntroMail;
    try {
      // Extract JSON from potential markdown code blocks
      let jsonStr = textContent.text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      generatedMail = JSON.parse(jsonStr);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    return NextResponse.json({
      success: true,
      mail: generatedMail,
      task: {
        id: task.id,
        title: task.title,
        client: task.client,
      },
      consultants: selectedConsultants.map(c => ({
        id: c.id,
        name: c.name,
        title: c.title,
      })),
    });
  } catch (error) {
    console.error("Intro mail generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate intro mail" },
      { status: 500 }
    );
  }
}
