export type Language = 'en' | 'hi';

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type DecisionType = 'diy' | 'diy_with_caution' | 'call_a_pro';
export type UrgencyType = 'can_wait' | 'fix_this_week' | 'fix_now';
export type DifficultyType = 'easy' | 'medium' | 'hard';
export type ApplianceStatus = 'pending' | 'fixed' | 'needs_pro';

export interface LikelyCause {
  cause: string;
  probability_percent: number;
  confidence: ConfidenceLevel;
  reasoning: string;
}

export interface FixStep {
  step: number;
  instruction: string;
  tools_needed: string[];
  warning: string | null;
}

export interface ToolOrPart {
  item: string;
  approx_price_inr: string;
}

export interface Verdict {
  decision: DecisionType;
  reason: string;
  estimated_diy_cost_inr: string;
  estimated_pro_cost_inr: string;
  difficulty: DifficultyType;
  time_needed: string;
}

export interface Observations {
  visual: string[];
  audio: string[];
}

export interface DiagnosisResponse {
  appliance: string;
  problem_summary: string;
  observations: Observations;
  safety_warnings: string[];
  likely_causes: LikelyCause[];
  fix_steps: FixStep[];
  tools_and_parts_list: ToolOrPart[];
  verdict: Verdict;
  follow_up_question: string | null;
  urgency: UrgencyType;
  maintenance_tips: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  updatedDiagnosis?: DiagnosisResponse;
}

export interface SavedDiagnosis {
  id: string;
  timestamp: number;
  appliance: string;
  modelNumber?: string;
  extraNotes?: string;
  videoThumbnail?: string;
  videoDurationSec?: number;
  diagnosis: DiagnosisResponse;
  status: ApplianceStatus;
  completedSteps: number[];
  chatHistory: ChatMessage[];
  language: Language;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchGroundingResult {
  text: string;
  manualSources: GroundingSource[];
  partSources: GroundingSource[];
  summary: string;
}

export interface MaintenanceReminder {
  id: string;
  appliance: string;
  title: string;
  frequency: string;
  dueDate: string;
  completed: boolean;
  notes?: string;
}

export interface SavedDevicePdf {
  id: string;
  diagnosisId: string;
  filename: string;
  appliance: string;
  timestamp: number;
  dataUri: string;
  fileSizeBytes: number;
}

