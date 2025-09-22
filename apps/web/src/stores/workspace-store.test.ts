import { act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { WorkspaceBootstrapPayload } from "@strategybuilder/shared";
import { useWorkspaceStore } from "./workspace-store";

const bootstrapPayload: WorkspaceBootstrapPayload = {
  workspace: {
    id: "workspace-1",
    name: "Demo Workspace",
    templateId: "demo-onboarding",
    createdAt: new Date().toISOString()
  },
  strategy: {
    id: "strategy-1",
    name: "Momentum Playground",
    description: "Sample graph",
    createdAt: new Date().toISOString()
  },
  version: {
    id: "version-1",
    versionName: "v1",
    createdAt: new Date().toISOString(),
    graph: {
      nodes: [
        { id: "n1", label: "Market Data", type: "source" },
        { id: "n2", label: "Signal", type: "indicator" }
      ],
      edges: [{ id: "e1", source: "n1", target: "n2" }]
    },
    educatorCallouts: [
      { id: "callout-1", title: "Welcome", body: "Start here", placement: "top" }
    ]
  },
  created: true,
  userId: "user-1"
};

afterEach(() => {
  useWorkspaceStore.setState({
    workspace: null,
    strategy: null,
    graph: null,
    callouts: [],
    hydrated: false
  });
});

describe("workspace store", () => {
  it("hydrates state from bootstrap payload", () => {
    act(() => {
      useWorkspaceStore.getState().hydrateFromBootstrap(bootstrapPayload);
    });

    const state = useWorkspaceStore.getState();
    expect(state.workspace?.id).toBe("workspace-1");
    expect(state.strategy?.id).toBe("strategy-1");
    expect(state.graph?.nodes).toHaveLength(2);
    expect(state.callouts).toHaveLength(1);
    expect(state.hydrated).toBe(true);
  });
});
