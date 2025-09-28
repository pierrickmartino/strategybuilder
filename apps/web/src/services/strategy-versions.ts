import type {
  CanvasValidationIssue,
  EducatorCallout,
  StrategyGraph,
  StrategyVersionSummary
} from "@strategybuilder/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type CreateVersionPayload = {
  graph: StrategyGraph;
  label?: string | null;
  notes?: string | null;
  educatorCallouts?: EducatorCallout[];
};

async function request<T>(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Request failed (${response.status}): ${details}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listStrategyVersions(
  token: string,
  strategyId: string
): Promise<StrategyVersionSummary[]> {
  const payload = await request<{ versions: StrategyVersionSummary[] }>(
    token,
    `/strategies/${strategyId}/versions`
  );
  return payload.versions;
}

export async function createStrategyVersion(
  token: string,
  strategyId: string,
  payload: CreateVersionPayload
): Promise<StrategyVersionSummary> {
  const body = await request<{ version: StrategyVersionSummary }>(token, `/strategies/${strategyId}/versions`, {
    method: "POST",
    body: JSON.stringify({
      graph: payload.graph,
      label: payload.label ?? undefined,
      notes: payload.notes ?? undefined,
      educatorCallouts: payload.educatorCallouts ?? []
    })
  });
  return body.version;
}

export async function validateStrategyGraph(
  token: string,
  strategyId: string,
  graph: StrategyGraph
): Promise<CanvasValidationIssue[]> {
  const payload = await request<{ issues: CanvasValidationIssue[] }>(
    token,
    `/strategies/${strategyId}/versions/validate`,
    {
      method: "POST",
      body: JSON.stringify({ graph })
    }
  );
  return payload.issues;
}

export async function revertStrategyVersion(
  token: string,
  strategyId: string,
  versionId: string
): Promise<StrategyVersionSummary> {
  const payload = await request<{ version: StrategyVersionSummary }>(
    token,
    `/strategies/${strategyId}/versions/${versionId}/revert`,
    {
      method: "POST"
    }
  );
  return payload.version;
}

