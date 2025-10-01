import { afterEach, describe, expect, it, vi } from "vitest";

import { sendOnboardingEvents } from "@/services/analytics";

const sampleEvent = {
  stepId: "tour-canvas" as const,
  status: "completed" as const,
  occurredAt: "2025-09-30T18:49:34.000Z",
  properties: { templateId: "abc123" }
};

describe("sendOnboardingEvents", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("serialises onboarding events to snake_case before posting", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn() });
    vi.stubGlobal("fetch", fetchMock);

    await sendOnboardingEvents("token", [sampleEvent]);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body as string);
    expect(body).toEqual({
      events: [
        {
          step_id: "tour-canvas",
          status: "completed",
          occurred_at: "2025-09-30T18:49:34.000Z",
          properties: { templateId: "abc123" }
        }
      ]
    });
  });

  it("skips network call when no events are queued", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await sendOnboardingEvents("token", []);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
