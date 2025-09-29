"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type {
  OnboardingEventPayload,
  OnboardingProgressState,
  OnboardingStepDefinition,
  OnboardingStepId,
  OnboardingStepStatus
} from "@strategybuilder/shared";

type StepState = OnboardingProgressState["steps"][OnboardingStepId];

type OnboardingProgressStore = {
  steps: Record<OnboardingStepId, StepState>;
  definitions: OnboardingStepDefinition[];
  updatedAt: string;
  markStep: (
    stepId: OnboardingStepId,
    status: OnboardingStepStatus,
    properties?: OnboardingEventPayload["properties"]
  ) => void;
  reset: () => void;
  getProgress: () => {
    completed: number;
    total: number;
    percentage: number;
  };
  pendingEvents: OnboardingEventPayload[];
  drainEvents: () => OnboardingEventPayload[];
  requeueEvents: (events: OnboardingEventPayload[]) => void;
};

const STEP_DEFINITIONS: OnboardingStepDefinition[] = [
  {
    id: "tour-canvas",
    title: "Tour the canvas",
    description: "Review nodes, indicators, and wiring to understand the strategy graph."
  },
  {
    id: "load-template",
    title: "Load a template",
    description: "Pick a starter strategy template to see a configured graph."
  },
  {
    id: "run-backtest",
    title: "Run your first backtest",
    description: "Execute a simulation and review the results panel."
  }
];

const defaultState = (): Pick<OnboardingProgressStore, "steps" | "updatedAt" | "pendingEvents"> => ({
  steps: STEP_DEFINITIONS.reduce(
    (accumulator, step) => ({
      ...accumulator,
      [step.id]: {
        status: step.id === "tour-canvas" ? "in-progress" : "pending",
        completedAt: null
      }
    }),
    {} as Record<OnboardingStepId, StepState>
  ),
  updatedAt: new Date().toISOString(),
  pendingEvents: []
});

const storageName = "strategybuilder:onboarding-progress";

export const useOnboardingProgress = create<OnboardingProgressStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState(),
        definitions: STEP_DEFINITIONS,
        markStep: (stepId, status, properties) => {
          const step = get().steps[stepId];
          if (!step) return;

          if (step.status === status) {
            return;
          }

          const nextStatus: OnboardingStepStatus = status;
          const completedAt = nextStatus === "completed" ? new Date().toISOString() : step.completedAt;
          const updatedSteps = {
            ...get().steps,
            [stepId]: {
              status: nextStatus,
              completedAt: completedAt ?? null
            }
          };

          // Promote next step to in-progress when current completes.
          if (nextStatus === "completed") {
            const remainingSteps = STEP_DEFINITIONS.filter((definition) => definition.id !== stepId);
            for (const definition of remainingSteps) {
              const current = updatedSteps[definition.id];
              if (current.status === "pending") {
                updatedSteps[definition.id] = { ...current, status: "in-progress" };
                break;
              }
            }
          }

          const occurredAt = new Date().toISOString();
          const event: OnboardingEventPayload = {
            stepId,
            status: nextStatus,
            occurredAt,
            properties
          };

          set({
            steps: updatedSteps,
            updatedAt: occurredAt,
            pendingEvents: [...get().pendingEvents, event]
          });
        },
        getProgress: () => {
          const steps = Object.values(get().steps);
          const total = steps.length;
          const completed = steps.filter((step) => step.status === "completed").length;
          return {
            completed,
            total,
            percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
          };
        },
        reset: () => set({ ...defaultState() }),
        drainEvents: () => {
          const events = [...get().pendingEvents];
          if (events.length === 0) {
            return [];
          }
          set({ pendingEvents: [] });
          return events;
        },
        requeueEvents: (events) => {
          if (!events.length) {
            return;
          }
          set((state) => ({ pendingEvents: [...events, ...state.pendingEvents] }));
        }
      }),
      {
        name: storageName,
        version: 1
      }
    )
  )
);
