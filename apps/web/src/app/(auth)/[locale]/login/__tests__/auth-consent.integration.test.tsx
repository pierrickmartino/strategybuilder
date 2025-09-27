import React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AuthForm from "../auth-form";
import en from "@/i18n/dictionaries/en";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithOAuthMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  }),
  useSearchParams: () => {
    const params = new URLSearchParams();
    return {
      get: (key: string) => params.get(key)
    };
  }
}));

vi.mock("@supabase/auth-helpers-react", () => ({
  useSupabaseClient: () => ({
    auth: {
      signInWithOAuth: signInWithOAuthMock
    }
  })
}));

describe("AuthForm OAuth consent", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInWithOAuthMock.mockReset();
    signInWithOAuthMock.mockResolvedValue({ error: null });
  });

  it("blocks OAuth sign-in until consent checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<AuthForm locale="en" dictionary={en.auth} />);

    const oauthButton = screen.getByRole("button", { name: en.auth.oauthButton });
    await user.click(oauthButton);

    expect(signInWithOAuthMock).not.toHaveBeenCalled();
    expect(screen.getByText(en.auth.messages.consentRequired)).toBeInTheDocument();
  });

  it("adds consent metadata flag to the OAuth redirect when accepted", async () => {
    const user = userEvent.setup();
    render(<AuthForm locale="en" dictionary={en.auth} />);

    const consentCheckbox = screen.getByRole("checkbox", { name: new RegExp(en.auth.consentLabel) });
    await user.click(consentCheckbox);

    const oauthButton = screen.getByRole("button", { name: en.auth.oauthButton });
    await user.click(oauthButton);

    expect(signInWithOAuthMock).toHaveBeenCalledTimes(1);
    const callArgs = signInWithOAuthMock.mock.calls[0][0];
    expect(callArgs.provider).toBe("google");
    const redirectUrl = new URL(callArgs.options.redirectTo);
    expect(redirectUrl.searchParams.get("consent")).toBe("true");
    expect(redirectUrl.searchParams.get("next")).toBe("/en/strategies");
  });
});
