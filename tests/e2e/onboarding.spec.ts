import { expect, test } from "@playwright/test";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { Client } from "pg";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:8000/api/v1";
const AUDIENCE = process.env.E2E_SUPABASE_API_AUDIENCE ?? process.env.SUPABASE_API_AUDIENCE ?? "authenticated";
const DATABASE_URL = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
const LATENCY_BUDGET_MS = 150;

function normaliseDatabaseUrl(url?: string) {
  if (!url) {
    return undefined;
  }
  if (url.startsWith("postgresql+asyncpg://")) {
    return url.replace("postgresql+asyncpg://", "postgresql://");
  }
  return url;
}

async function verifyAuditEvent(client: Client, userId: string, expectedWorkspaceId: string) {
  const result = await client.query(
    "SELECT event_type, payload->>'workspaceId' AS workspace_id FROM compliance_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  expect(result.rowCount).toBe(1);
  const event = result.rows[0];
  expect(event.event_type).toBe("workspace.bootstrap");
  expect(event.workspace_id).toBe(expectedWorkspaceId);
}

async function verifyComplianceEvent(client: Client, userId: string, eventType: string) {
  const result = await client.query(
    "SELECT event_type, payload, created_at FROM compliance_events WHERE user_id = $1 AND event_type = $2 ORDER BY created_at DESC LIMIT 1",
    [userId, eventType]
  );
  expect(result.rowCount).toBe(1);
  return result.rows[0];
}

async function cleanupBootstrapArtifacts(client: Client, userId: string) {
  await client.query("DELETE FROM onboarding_events WHERE user_id = $1", [userId]);
  await client.query("DELETE FROM compliance_events WHERE user_id = $1", [userId]);
  await client.query(
    "DELETE FROM strategy_versions WHERE strategy_id IN (SELECT id FROM strategies WHERE workspace_id IN (SELECT id FROM workspaces WHERE user_id = $1))",
    [userId]
  );
  await client.query(
    "DELETE FROM strategies WHERE workspace_id IN (SELECT id FROM workspaces WHERE user_id = $1)",
    [userId]
  );
  await client.query("DELETE FROM workspaces WHERE user_id = $1", [userId]);
  await client.query("DELETE FROM users WHERE id = $1", [userId]);
}

test.describe("Onboarding bootstrap audit trail", () => {
  test("should create audit trail entries after completing onboarding", async ({ request }) => {
    const jwtSecret = process.env.E2E_SUPABASE_JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET;
    const dbUrl = normaliseDatabaseUrl(DATABASE_URL);

    test.skip(!jwtSecret, "Supabase JWT secret not configured for e2e test");
    test.skip(!dbUrl, "Database URL not configured for e2e test");

    const userId = randomUUID();
    const email = `onboarding-e2e+${Date.now()}@example.com`;
    const claims = {
      sub: userId,
      email,
      aud: AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: {
        provider: "google",
        providers: ["google"],
        roles: ["builder"]
      },
      user_metadata: {
        accepted_simulation_only: true,
        accepted_simulation_only_at: new Date().toISOString()
      }
    };

    const token = jwt.sign(claims, jwtSecret!, {
      algorithm: "HS256",
      audience: AUDIENCE
    });

    const bootstrapStart = performance.now();
    const response = await request.post(`${API_BASE_URL}/workspaces/bootstrap`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const bootstrapDuration = performance.now() - bootstrapStart;

    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.created).toBe(true);
    expect(payload.workspace).toBeDefined();
    expect(payload.workspace.id).toBeDefined();
    expect(payload.userId).toBe(userId);
    expect(bootstrapDuration).toBeLessThan(LATENCY_BUDGET_MS * 2);

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    try {
      await verifyAuditEvent(client, userId, payload.workspace.id);

      const templatesResponse = await request.get(`${API_BASE_URL}/templates`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(templatesResponse.ok()).toBeTruthy();
      const templatesPayload = await templatesResponse.json();
      expect(Array.isArray(templatesPayload.templates)).toBe(true);
      expect(templatesPayload.templates.length).toBeGreaterThanOrEqual(3);
      const templateId = templatesPayload.templates[0].id as string;

      const templateEvent = await verifyComplianceEvent(client, userId, "template.visibility");
      const templateCount = Number(templateEvent.payload.count ?? 0);
      expect(templateCount).toBeGreaterThanOrEqual(3);

      const educationResponse = await request.get(`${API_BASE_URL}/education/onboarding`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(educationResponse.ok()).toBeTruthy();
      const educationEvent = await verifyComplianceEvent(client, userId, "education.delivery");
      const educationCount = Number(educationEvent.payload.count ?? 0);
      expect(educationCount).toBeGreaterThanOrEqual(1);

      const analyticsPayload = {
        events: [
          {
            stepId: "load-template",
            status: "completed",
            occurredAt: new Date().toISOString(),
            properties: { templateId }
          }
        ]
      };

      const analyticsResponse = await request.post(`${API_BASE_URL}/analytics/onboarding`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        data: analyticsPayload
      });
      expect(analyticsResponse.status()).toBe(202);

      const analyticsRows = await client.query(
        "SELECT step_id, status, properties->>'templateId' AS template_id FROM onboarding_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [userId]
      );
      expect(analyticsRows.rowCount).toBe(1);
      const analyticsEvent = analyticsRows.rows[0];
      expect(analyticsEvent.step_id).toBe("load-template");
      expect(analyticsEvent.status).toBe("completed");
      expect(analyticsEvent.template_id).toBe(templateId);
    } finally {
      await cleanupBootstrapArtifacts(client, userId);
      await client.end();
    }
  });
});
