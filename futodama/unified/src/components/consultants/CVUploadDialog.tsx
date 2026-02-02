"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type UploadState = "idle" | "uploading" | "analyzing" | "review" | "creating" | "success" | "error";

interface ParsedCV {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  professionalProfile: string;
  skills: Array<{ name: string; category: string; level: string }>;
  experience: Array<{
    company: string;
    project: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number;
  }>;
  confidence: number;
}

interface CVUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const analysisPhrases = [
  { en: "Reading document structure...", da: "Læser dokumentstruktur..." },
  { en: "Identifying contact information...", da: "Identificerer kontaktoplysninger..." },
  { en: "Analyzing work experience...", da: "Analyserer arbejdserfaring..." },
  { en: "Extracting competencies...", da: "Udtrækker kompetencer..." },
  { en: "Validating data...", da: "Validerer data..." },
];

export function CVUploadDialog({ isOpen, onClose }: CVUploadDialogProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [state, setState] = useState<UploadState>("idle");
  const [analysisPhrase, setAnalysisPhrase] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedCV | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetState = useCallback(() => {
    setState("idle");
    setParsedData(null);
    setError(null);
    setAnalysisPhrase(0);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      setError(t.cvUpload.onlyPdfWord);
      setState("error");
      return;
    }

    setState("uploading");
    
    try {
      // Simulate upload delay
      await new Promise(r => setTimeout(r, 800));
      setState("analyzing");

      // Cycle through analysis phrases
      const phraseInterval = setInterval(() => {
        setAnalysisPhrase(prev => (prev + 1) % analysisPhrases.length);
      }, 1500);

      // Create form data and call API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cv/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(phraseInterval);

      if (!response.ok) {
        throw new Error("Failed to analyze CV");
      }

      const data = await response.json();
      
      // Transform API response to our format
      const parsed: ParsedCV = {
        name: data.contactInfo?.name || "Unknown",
        title: data.claims?.currentRole || "Consultant",
        email: data.contactInfo?.email || "",
        phone: data.contactInfo?.phone || "",
        location: data.contactInfo?.location || "",
        professionalProfile: data.gardenerDraft?.professionalProfile || "",
        skills: (data.claims?.skills || []).map((s: string) => ({
          name: s,
          category: "Technical",
          level: "experienced"
        })),
        experience: (data.experience || []).slice(0, 3).map((exp: { company: string; role: string; dates: string; description: string }) => ({
          company: exp.company || "Company",
          project: "",
          role: exp.role || "Role",
          startDate: exp.dates?.split("-")[0]?.trim() || "2020",
          endDate: exp.dates?.split("-")[1]?.trim() || "Present",
          description: exp.description || "",
        })),
        education: (data.education || []).slice(0, 2).map((edu: { institution: string; degree: string; field: string; year: number }) => ({
          institution: edu.institution || "University",
          degree: edu.degree || "Degree",
          field: edu.field || "Field",
          startYear: (edu.year || 2018) - 4,
          endYear: edu.year || 2018,
        })),
        confidence: data.healthScore || 75,
      };

      setParsedData(parsed);
      setState("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateConsultant = async () => {
    if (!parsedData) return;
    
    setState("creating");
    
    // Simulate creation delay
    await new Promise(r => setTimeout(r, 1000));
    
    // In a real app, this would POST to an API
    // For now, redirect to the consultants list
    setState("success");
    
    setTimeout(() => {
      handleClose();
      router.push("/consultants");
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t.cvUpload.title}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Idle State - Dropzone */}
            {state === "idle" && (
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragging
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-green-400"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {t.cvUpload.dropzone}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t.cvUpload.orClick}
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                  {t.cvUpload.selectFile}
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  {t.cvUpload.supportedFormats}
                </p>
              </div>
            )}

            {/* Uploading/Analyzing State */}
            {(state === "uploading" || state === "analyzing") && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {state === "uploading" ? t.cvUpload.uploading : t.cvUpload.parsing}
                </p>
                {state === "analyzing" && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                    {analysisPhrases[analysisPhrase][locale]}
                  </p>
                )}
              </div>
            )}

            {/* Review State */}
            {state === "review" && parsedData && (
              <div className="space-y-6">
                {/* Confidence Score */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.cvUpload.aiConfidence}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${parsedData.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {parsedData.confidence}%
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.common.name}
                    </label>
                    <input
                      type="text"
                      value={parsedData.name}
                      onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={parsedData.title}
                      onChange={(e) => setParsedData({ ...parsedData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.cvUpload.competencies} ({parsedData.skills.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.slice(0, 10).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {parsedData.skills.length > 10 && (
                      <span className="px-2.5 py-1 text-gray-500 text-sm">
                        +{parsedData.skills.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Experience Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.cvUpload.experience} ({parsedData.experience.length})
                  </label>
                  <div className="space-y-2">
                    {parsedData.experience.slice(0, 3).map((exp, i) => (
                      <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{exp.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Preview */}
                {parsedData.education.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.cvUpload.education} ({parsedData.education.length})
                    </label>
                    <div className="space-y-2">
                      {parsedData.education.map((edu, i) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{edu.degree} — {edu.field}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{edu.institution} • {edu.startYear}-{edu.endYear}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Creating State */}
            {state === "creating" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {t.cvUpload.creating}
                </p>
              </div>
            )}

            {/* Success State */}
            {state === "success" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t.cvUpload.success}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.cvUpload.redirecting}
                </p>
              </div>
            )}

            {/* Error State */}
            {state === "error" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t.cvUpload.error}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  {error || t.cvUpload.somethingWrong}
                </p>
                <button
                  onClick={resetState}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {t.cvUpload.tryAgain}
                </button>
              </div>
            )}
          </div>

          {/* Footer - only show for review state */}
          {state === "review" && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={resetState}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cvUpload.startOver}
              </button>
              <button
                onClick={handleCreateConsultant}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {t.cvUpload.createConsultant}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
