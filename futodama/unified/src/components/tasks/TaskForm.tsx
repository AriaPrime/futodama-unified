"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X, Sparkles } from "lucide-react";
import type { TaskRequirement, RequirementPriority } from "@/types";

interface TaskFormProps {
  onSubmit?: (task: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
}

interface TaskFormData {
  title: string;
  client: string;
  description: string;
  requirements: TaskRequirement[];
  deadline: string;
  budgetMin: number;
  budgetMax: number;
}

const priorityColors: Record<RequirementPriority, string> = {
  required: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  preferred: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  nice_to_have: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export function TaskForm({ onSubmit, initialData }: TaskFormProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || "",
    client: initialData?.client || "",
    description: initialData?.description || "",
    requirements: initialData?.requirements || [],
    deadline: initialData?.deadline || "",
    budgetMin: initialData?.budgetMin || 1000,
    budgetMax: initialData?.budgetMax || 1300,
  });

  const [newRequirement, setNewRequirement] = useState({
    value: "",
    priority: "required" as RequirementPriority,
  });

  const labels = locale === "da" ? {
    title: "Titel",
    titlePlaceholder: "F.eks. Senior Full-Stack Developer",
    client: "Kunde",
    clientPlaceholder: "Kundens navn",
    description: "Beskrivelse",
    descriptionPlaceholder: "Beskriv opgaven og konteksten...",
    requirements: "Krav",
    addRequirement: "Tilføj krav",
    requirementPlaceholder: "F.eks. React, 5+ års erfaring",
    required: "Påkrævet",
    preferred: "Foretrukket",
    niceToHave: "Nice to have",
    deadline: "Deadline",
    budget: "Budget (DKK/time)",
    min: "Min",
    max: "Max",
    cancel: "Annuller",
    saveDraft: "Gem kladde",
    createAndMatch: "Opret & find matches",
  } : {
    title: "Title",
    titlePlaceholder: "e.g. Senior Full-Stack Developer",
    client: "Client",
    clientPlaceholder: "Client name",
    description: "Description",
    descriptionPlaceholder: "Describe the task and context...",
    requirements: "Requirements",
    addRequirement: "Add requirement",
    requirementPlaceholder: "e.g. React, 5+ years experience",
    required: "Required",
    preferred: "Preferred",
    niceToHave: "Nice to have",
    deadline: "Deadline",
    budget: "Budget (DKK/hour)",
    min: "Min",
    max: "Max",
    cancel: "Cancel",
    saveDraft: "Save draft",
    createAndMatch: "Create & find matches",
  };

  const addRequirement = () => {
    if (!newRequirement.value.trim()) return;
    
    const req: TaskRequirement = {
      id: `req-${Date.now()}`,
      type: "skill",
      value: newRequirement.value.trim(),
      priority: newRequirement.priority,
    };
    
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, req],
    }));
    
    setNewRequirement({ value: "", priority: "required" });
  };

  const removeRequirement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r.id !== id),
    }));
  };

  const handleSubmit = (asDraft: boolean = false) => {
    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Default behavior: redirect to matching
      router.push(`/matching?taskId=new`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{locale === "da" ? "Opgavedetaljer" : "Task Details"}</CardTitle>
          <CardDescription>
            {locale === "da" 
              ? "Beskriv hvad du leder efter"
              : "Describe what you're looking for"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{labels.title}</Label>
              <Input
                id="title"
                placeholder={labels.titlePlaceholder}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">{labels.client}</Label>
              <Input
                id="client"
                placeholder={labels.clientPlaceholder}
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{labels.description}</Label>
            <Textarea
              id="description"
              placeholder={labels.descriptionPlaceholder}
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{labels.requirements}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing requirements */}
          {formData.requirements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((req) => (
                <span
                  key={req.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${priorityColors[req.priority]}`}
                >
                  {req.value}
                  <button
                    onClick={() => removeRequirement(req.id)}
                    className="hover:opacity-70"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add new requirement */}
          <div className="flex gap-2">
            <Input
              placeholder={labels.requirementPlaceholder}
              value={newRequirement.value}
              onChange={(e) => setNewRequirement(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addRequirement()}
              className="flex-1"
            />
            <select
              value={newRequirement.priority}
              onChange={(e) => setNewRequirement(prev => ({ ...prev, priority: e.target.value as RequirementPriority }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="required">{labels.required}</option>
              <option value="preferred">{labels.preferred}</option>
              <option value="nice_to_have">{labels.niceToHave}</option>
            </select>
            <Button onClick={addRequirement} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "da" ? "Tidsramme & Budget" : "Timeline & Budget"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="deadline">{labels.deadline}</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMin">{labels.budget} ({labels.min})</Label>
              <Input
                id="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax">{labels.budget} ({labels.max})</Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          {labels.cancel}
        </Button>
        <Button variant="outline" onClick={() => handleSubmit(true)}>
          {labels.saveDraft}
        </Button>
        <Button onClick={() => handleSubmit(false)}>
          <Sparkles className="mr-2 h-4 w-4" />
          {labels.createAndMatch}
        </Button>
      </div>
    </div>
  );
}
