"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { consultants } from "@/lib/mock-data/consultants";
import { tasks } from "@/lib/mock-data/tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  User,
  Building2,
  FileText,
  Wand2,
  Send
} from "lucide-react";

type Step = "select" | "configure" | "preview";
type Language = "en" | "da";
type Tone = "formal" | "friendly" | "persuasive";

interface GeneratedMail {
  subject: string;
  body: string;
  consultantSummaries: {
    consultantId: string;
    name: string;
    highlight: string;
  }[];
}

function IntroMailContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // Step state
  const [step, setStep] = useState<Step>("select");

  // Selection state
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedConsultantIds, setSelectedConsultantIds] = useState<string[]>([]);

  // Configuration state
  const [recipientName, setRecipientName] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [language, setLanguage] = useState<Language>(locale as Language);
  const [tone, setTone] = useState<Tone>("friendly");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMail, setGeneratedMail] = useState<GeneratedMail | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from URL params
  useEffect(() => {
    const taskParam = searchParams.get("task");
    const consultantParam = searchParams.get("consultants");

    if (taskParam) {
      setSelectedTaskId(taskParam);
    }

    if (consultantParam) {
      setSelectedConsultantIds(consultantParam.split(","));
    }
  }, [searchParams]);

  // Pre-fill recipient company when task is selected
  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task && !recipientCompany) {
        setRecipientCompany(task.client);
      }
    }
  }, [selectedTaskId, recipientCompany]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const selectedConsultants = consultants.filter(c => selectedConsultantIds.includes(c.id));
  const activeTasks = tasks.filter(t => t.status === "active");

  const toggleConsultant = (id: string) => {
    setSelectedConsultantIds(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/intro-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultantIds: selectedConsultantIds,
          taskId: selectedTaskId,
          recipientName: recipientName || undefined,
          recipientCompany: recipientCompany || undefined,
          language,
          tone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate intro mail");
      }

      const data = await response.json();
      setGeneratedMail(data.mail);
      setEditedSubject(data.mail.subject);
      setEditedBody(data.mail.body);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const fullEmail = `Subject: ${editedSubject}\n\n${editedBody}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBody = async () => {
    await navigator.clipboard.writeText(editedBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canProceedToConfig = selectedTaskId && selectedConsultantIds.length > 0;
  const canGenerate = canProceedToConfig;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Mail className="h-8 w-8" />
            {t.dashboard.generateIntroMail}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AI-powered introduction emails for your consultant proposals
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-4">
        {(["select", "configure", "preview"] as Step[]).map((s, idx) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => {
                if (s === "select") setStep(s);
                if (s === "configure" && canProceedToConfig) setStep(s);
                if (s === "preview" && generatedMail) setStep(s);
              }}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : s === "select" || (s === "configure" && canProceedToConfig) || (s === "preview" && generatedMail)
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
              disabled={
                (s === "configure" && !canProceedToConfig) ||
                (s === "preview" && !generatedMail)
              }
            >
              {idx + 1}
            </button>
            <span className={`ml-2 text-sm hidden sm:inline ${step === s ? "font-medium" : "text-muted-foreground"}`}>
              {s === "select" && "Select"}
              {s === "configure" && "Configure"}
              {s === "preview" && "Preview"}
            </span>
            {idx < 2 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Task & Consultants */}
      {step === "select" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Task Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select Task
              </CardTitle>
              <CardDescription>
                Choose the task/project you&apos;re proposing consultants for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      <div className="flex flex-col">
                        <span>{task.title}</span>
                        <span className="text-xs text-muted-foreground">{task.client}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTask && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-medium">{selectedTask.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.client}</p>
                  <p className="text-sm mt-2">{selectedTask.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedTask.requirements.slice(0, 5).map(req => (
                      <span
                        key={req.id}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          req.priority === "required"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {req.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultant Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Consultants
              </CardTitle>
              <CardDescription>
                {selectedConsultantIds.length} selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {consultants.map(consultant => (
                  <label
                    key={consultant.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConsultantIds.includes(consultant.id)
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Checkbox
                      checked={selectedConsultantIds.includes(consultant.id)}
                      onCheckedChange={() => toggleConsultant(consultant.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{consultant.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{consultant.title}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      consultant.availability.status === "available"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : consultant.availability.status === "partially_available"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {consultant.availability.status === "available" ? "Available" : 
                       consultant.availability.status === "partially_available" ? "Partial" : "Busy"}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === "configure" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Configure Email
            </CardTitle>
            <CardDescription>
              Customize the intro mail generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <h4 className="font-medium mb-2">Selection Summary</h4>
              <p className="text-sm">
                <span className="text-muted-foreground">Task:</span>{" "}
                {selectedTask?.title} ({selectedTask?.client})
              </p>
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Consultants:</span>{" "}
                {selectedConsultants.map(c => c.name).join(", ")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Recipient Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipientName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Recipient Name
                  </Label>
                  <Input
                    id="recipientName"
                    placeholder="e.g., John Smith"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="recipientCompany" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Recipient Company
                  </Label>
                  <Input
                    id="recipientCompany"
                    placeholder="e.g., Acme Corp"
                    value={recipientCompany}
                    onChange={(e) => setRecipientCompany(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Generation Options */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="da">Dansk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly & Professional</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview & Edit */}
      {step === "preview" && generatedMail && (
        <div className="space-y-6">
          {/* Consultant Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Consultant Highlights</CardTitle>
              <CardDescription>AI-generated summaries for each candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {generatedMail.consultantSummaries.map(summary => {
                  const consultant = consultants.find(c => c.id === summary.consultantId);
                  return (
                    <div key={summary.consultantId} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{summary.name}</p>
                          <p className="text-xs text-muted-foreground">{consultant?.title}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{summary.highlight}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Email Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Generated Email
              </CardTitle>
              <CardDescription>Edit as needed before copying</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="mt-1 font-medium"
                />
              </div>

              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="mt-1 min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline">
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Full Email"}
                </Button>
                <Button onClick={handleCopyBody} variant="outline">
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copy Body Only
                </Button>
                <Button variant="outline" onClick={() => {
                  setGeneratedMail(null);
                  setStep("configure");
                }}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (step === "configure") setStep("select");
            if (step === "preview") setStep("configure");
          }}
          disabled={step === "select"}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step === "select" && (
          <Button
            onClick={() => setStep("configure")}
            disabled={!canProceedToConfig}
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {step === "configure" && (
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Email
              </>
            )}
          </Button>
        )}

        {step === "preview" && (
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        )}
      </div>
    </div>
  );
}

function IntroMailLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function IntroMailPage() {
  return (
    <Suspense fallback={<IntroMailLoading />}>
      <IntroMailContent />
    </Suspense>
  );
}
