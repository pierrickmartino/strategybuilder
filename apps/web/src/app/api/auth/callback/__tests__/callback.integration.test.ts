import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../route";

const supabaseAuthMocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  refreshSession: vi.fn()
}));

const createSupabaseServerClient = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    auth: supabaseAuthMocks
  })
);

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient
}));

describe("OAuth consent callback", () => {
  beforeEach(() => {
    supabaseAuthMocks.exchangeCodeForSession.mockReset();
    supabaseAuthMocks.getUser.mockReset();
    supabaseAuthMocks.updateUser.mockReset();
    supabaseAuthMocks.refreshSession.mockReset();
    createSupabaseServerClient.mockClear();
  });

  it("updates Supabase metadata when consent is accepted", async () => {
    supabaseAuthMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    supabaseAuthMocks.getUser.mockResolvedValue({
      data: {
        user: {
          user_metadata: {
            accepted_simulation_only: false
          }
        }
      },
      error: null
    });
    supabaseAuthMocks.updateUser.mockResolvedValue({ error: null });
    supabaseAuthMocks.refreshSession.mockResolvedValue({ error: null });

    const request = {
      url: "https://example.com/api/auth/callback?code=test-code&consent=true&locale=en&next=%2Fen%2Fstrategies"
    } as unknown as Parameters<typeof GET>[0];
    const response = await GET(request);

    expect(supabaseAuthMocks.updateUser).toHaveBeenCalledTimes(1);
    const payload = supabaseAuthMocks.updateUser.mock.calls[0][0];
    expect(payload.data.accepted_simulation_only).toBe(true);
    expect(payload.data.accepted_simulation_only_at).toBeDefined();
    expect(supabaseAuthMocks.refreshSession).toHaveBeenCalledTimes(1);
    expect(response.headers.get("location")).toBe("https://example.com/en/strategies");
  });

  it("redirects to login when the session refresh fails", async () => {
    supabaseAuthMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    supabaseAuthMocks.getUser.mockResolvedValue({
      data: {
        user: {
          user_metadata: {
            accepted_simulation_only: false
          }
        }
      },
      error: null
    });
    supabaseAuthMocks.updateUser.mockResolvedValue({ error: null });
    supabaseAuthMocks.refreshSession.mockResolvedValue({ error: { message: "refresh failed" } });

    const request = {
      url: "https://example.com/api/auth/callback?code=test-code&consent=true&locale=en&next=%2Fen%2Fstrategies"
    } as unknown as Parameters<typeof GET>[0];
    const response = await GET(request);

    expect(supabaseAuthMocks.refreshSession).toHaveBeenCalledTimes(1);
    expect(response.headers.get("location")).toBe(
      "https://example.com/en/login?error=session-refresh-failed&redirectTo=%2Fen%2Fstrategies"
    );
  });
});
