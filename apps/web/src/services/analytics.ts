import type { OnboardingEventPayload } from "@strategybuilder/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function sendOnboardingEvents(
  token: string,
  events: OnboardingEventPayload[]
): Promise<void> {
  if (events.length === 0) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/analytics/onboarding`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ events })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Failed to record onboarding analytics (${response.status}): ${detail}`);
  }
}
