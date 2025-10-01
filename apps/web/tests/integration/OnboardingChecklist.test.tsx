import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" })
}));

vi.mock("@/components/onboarding/OnboardingAnalyticsBridge", () => ({
  OnboardingAnalyticsBridge: () => null
}));

import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { useOnboardingProgress } from "@/stores/onboarding-progress";

describe("OnboardingChecklist", () => {
  beforeEach(() => {
    useOnboardingProgress.getState().reset();
    useOnboardingProgress.setState({ pendingEvents: [] });
  });

  it("renders steps and updates progress when marking complete", async () => {
    const user = userEvent.setup();
    render(<OnboardingChecklist />);

    expect(screen.getByText(/Guided onboarding/i)).toBeInTheDocument();
    expect(screen.getByText("0/3 · 0%")).toBeInTheDocument();

    const completeTourButton = screen.getByLabelText(/Mark step Tour the canvas as complete/i);
    await user.click(completeTourButton);

    expect(screen.getByText("1/3 · 33%")).toBeInTheDocument();
    const state = useOnboardingProgress.getState();
    expect(state.steps["tour-canvas"].status).toBe("completed");
  });
});
