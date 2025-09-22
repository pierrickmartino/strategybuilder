import { expect, test } from "@playwright/test";

// Placeholder end-to-end test that documents the expected onboarding flow.
// The scenario is marked as fixme until the hosted environment and Supabase credentials
// are wired into CI pipelines.
test.fixme("should create audit trail entries after completing onboarding", async ({ page }) => {
  await page.goto("http://localhost:3000/en/login");
  // Implementation pending: authenticate with Supabase test user, complete consent, and verify
  // that the audit log endpoint contains a `workspace.bootstrap` event for the session user.
  await expect(page).toHaveTitle(/Strategy Builder/);
});
