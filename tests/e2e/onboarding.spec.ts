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

async function cleanupBootstrapArtifacts(client: Client, userId: string) {
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
    } finally {
      await cleanupBootstrapArtifacts(client, userId);
      await client.end();
    }
  });
});
