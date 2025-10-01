import type { OnboardingEventPayload } from "@strategybuilder/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type SerializedOnboardingEvent = {
  step_id: OnboardingEventPayload["stepId"];
  status: OnboardingEventPayload["status"];
  occurred_at: OnboardingEventPayload["occurredAt"];
  properties?: OnboardingEventPayload["properties"];
};

function serializeEvent(event: OnboardingEventPayload): SerializedOnboardingEvent {
  return {
    step_id: event.stepId,
    status: event.status,
    occurred_at: event.occurredAt,
    properties: event.properties
  };
}

export async function sendOnboardingEvents(
  token: string,
  events: OnboardingEventPayload[]
): Promise<void> {
  if (events.length === 0) {
    return;
  }

  const serialized = events.map(serializeEvent);

  const response = await fetch(`${API_BASE_URL}/analytics/onboarding`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ events: serialized })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Failed to record onboarding analytics (${response.status}): ${detail}`);
  }
}
