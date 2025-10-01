import { beforeEach, describe, expect, it } from "vitest";

import { useOnboardingProgress } from "@/stores/onboarding-progress";

describe("useOnboardingProgress store", () => {
  beforeEach(() => {
    useOnboardingProgress.getState().reset();
    useOnboardingProgress.setState({ pendingEvents: [] });
  });

  it("marks a step complete and enqueues analytics event", () => {
    const initial = useOnboardingProgress.getState();
    expect(initial.steps["tour-canvas"].status).toBe("in-progress");

    useOnboardingProgress.getState().markStep("tour-canvas", "completed");

    const updated = useOnboardingProgress.getState();
    expect(updated.steps["tour-canvas"].status).toBe("completed");
    expect(updated.pendingEvents).toHaveLength(1);
    expect(updated.pendingEvents[0]?.stepId).toBe("tour-canvas");
  });

  it("drains queued events", () => {
    const store = useOnboardingProgress.getState();
    store.markStep("tour-canvas", "completed");
    store.markStep("load-template", "completed");

    const drained = useOnboardingProgress.getState().drainEvents();
    expect(drained).toHaveLength(2);
    expect(useOnboardingProgress.getState().pendingEvents).toHaveLength(0);
  });

  it("requeues events when delivery fails", () => {
    const store = useOnboardingProgress.getState();
    store.markStep("tour-canvas", "completed");
    const drained = useOnboardingProgress.getState().drainEvents();
    expect(drained).toHaveLength(1);

    useOnboardingProgress.getState().requeueEvents(drained);
    expect(useOnboardingProgress.getState().pendingEvents).toHaveLength(1);
    expect(useOnboardingProgress.getState().pendingEvents[0]?.status).toBe("completed");
  });
});
