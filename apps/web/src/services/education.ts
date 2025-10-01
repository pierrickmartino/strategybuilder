import type { EducationSuite } from "@strategybuilder/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function getOnboardingEducation(token: string): Promise<EducationSuite> {
  const response = await fetch(`${API_BASE_URL}/education/onboarding`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Failed to load education content (${response.status}): ${details}`);
  }

  return (await response.json()) as EducationSuite;
}
