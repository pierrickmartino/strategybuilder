export type OnboardingStepId = "tour-canvas" | "load-template" | "run-backtest";

export type OnboardingStepStatus = "pending" | "in-progress" | "completed";

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  description: string;
}

export interface OnboardingProgressState {
  steps: Record<OnboardingStepId, {
    status: OnboardingStepStatus;
    completedAt: string | null;
  }>;
  updatedAt: string;
}

export interface TemplateMetadataBlock {
  id: string;
  title: string;
  summary: string;
  tooltip: string;
}

export interface TemplateMetadata {
  slug: string;
  title: string;
  description: string;
  audience: "beginner" | "intermediate" | "advanced";
  estimatedBacktestMinutes: number;
  blocks: TemplateMetadataBlock[];
  disclaimers: string[];
  tags: string[];
}

export interface TemplateShare {
  id: string;
  strategyVersionId: string;
  educatorId: string;
  audienceScope: "cohort" | "public";
  metadata: TemplateMetadata;
  cloneCount: number;
  createdAt: string;
}

export interface OnboardingEventPayload {
  stepId: OnboardingStepId;
  status: OnboardingStepStatus;
  occurredAt: string;
  properties?: Record<string, string | number | boolean | null>;
}
