import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StrategyVersionSummary } from "@strategybuilder/shared";

import { useStrategyCanvas } from "@/stores/useStrategyCanvas";

vi.mock("@xyflow/react", () => {
  return {
    ReactFlowProvider: ({ children }: { children: ReactNode }) => <div data-testid="rf-provider">{children}</div>,
    ReactFlow: ({ children }: { children: ReactNode }) => <div data-testid="rf-instance">{children}</div>,
    Background: () => null,
    Controls: () => null
  };
});

const validateSpy = vi.fn();
const autosaveSpy = vi.fn();
const revertSpy = vi.fn();

vi.mock("@/hooks/use-strategy-versions", () => {
  return {
    useStrategyVersions: () => ({
      data: [
        {
          id: "version-history",
          version: 1,
          label: "Initial Seed",
          graph: {
            nodes: [],
            edges: []
          },
          validationIssues: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] satisfies StrategyVersionSummary[],
      isLoading: false
    }),
    useAutosaveStrategyVersion: () => ({
      mutateAsync: autosaveSpy.mockResolvedValue({
        id: "version-history",
        version: 2,
        label: "Auto Save",
        graph: { nodes: [], edges: [] },
        validationIssues: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      isPending: false
    }),
    useValidateStrategyGraph: () => ({
      mutateAsync: validateSpy.mockResolvedValue([
        { nodeId: "market", code: "missing_input", message: "Missing input", severity: "error" }
      ])
    }),
    useRevertStrategyVersion: () => ({
      mutateAsync: revertSpy.mockResolvedValue({
        id: "version-history",
        version: 3,
        label: "Reverted",
        graph: { nodes: [], edges: [] },
        validationIssues: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })
  };
});

import { StrategyCanvas } from "@/components/canvas/StrategyCanvas";

beforeEach(() => {
  useStrategyCanvas.getState().reset();
  useStrategyCanvas.getState().loadVersion({
    strategyId: "strategy-1",
    versionId: "version-1",
    graph: {
      nodes: [
        {
          id: "market",
          label: "Market",
          type: "market-data",
          metadata: { parameters: { symbol: "BTC-USD", granularity: "5m" } },
          position: { x: 0, y: 0 }
        }
      ],
      edges: []
    },
    issues: []
  });
  validateSpy.mockResolvedValue([{
    nodeId: "market",
    code: "missing_input",
    message: "Missing input",
    severity: "error"
  }]);
  revertSpy.mockResolvedValue({
    id: "version-history",
    version: 3,
    label: "Reverted",
    graph: { nodes: [], edges: [] },
    validationIssues: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

afterEach(() => {
  validateSpy.mockClear();
  autosaveSpy.mockClear();
  revertSpy.mockClear();
});

describe("StrategyCanvas integration", () => {
  it("runs validation and surfaces result summary", async () => {
    const onVersionSwitch = vi.fn();
    render(<StrategyCanvas strategyId="strategy-1" versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    fireEvent.click(screen.getByRole("button", { name: /^validate$/i }));

    await waitFor(() => expect(validateSpy).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/issues detected/i)).toBeInTheDocument());
  });

  it("invokes callbacks when loading versions", async () => {
    const onVersionSwitch = vi.fn();
    render(<StrategyCanvas strategyId="strategy-1" versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    fireEvent.click(screen.getByRole("button", { name: /Load/i }));

    await waitFor(() => expect(onVersionSwitch).toHaveBeenCalled());
  });
});
