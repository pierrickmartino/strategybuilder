import type { TemplateShare } from "@strategybuilder/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type TemplatesResponse = {
  templates: TemplateShare[];
};

export async function listTemplates(token: string): Promise<TemplateShare[]> {
  const response = await fetch(`${API_BASE_URL}/templates`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Failed to load templates (${response.status}): ${details}`);
  }

  const payload = (await response.json()) as TemplatesResponse;
  return payload.templates;
}
