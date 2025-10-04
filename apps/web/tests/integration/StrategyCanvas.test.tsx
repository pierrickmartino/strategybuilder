import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StrategyVersionSummary } from "@strategybuilder/shared";

import { useStrategyCanvas } from "@/stores/useStrategyCanvas";

vi.mock("@xyflow/react", async () => {
  const React = await import("react");
  const { useEffect } = React;

  const ReactFlowProvider = ({ children }: { children: ReactNode }) => (
    <div data-testid="rf-provider">{children}</div>
  );

  const ReactFlow = ({
    children,
    onInit
  }: {
    children: ReactNode;
    onInit?: (instance: { project: (point: { x: number; y: number }) => { x: number; y: number } }) => void;
  }) => {
    useEffect(() => {
      if (!onInit) {
        return;
      }
      onInit({
        project: (point: { x: number; y: number }) => point
      });
    }, [onInit]);

    return <div data-testid="rf-instance">{children}</div>;
  };

  return {
    ReactFlowProvider,
    ReactFlow,
    Background: () => null,
    Controls: () => null
  };
});

const validateSpy = vi.fn();
const autosaveSpy = vi.fn();
const revertSpy = vi.fn();

const STRATEGY_ID = "11111111-1111-4111-8111-111111111111";

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
    strategyId: STRATEGY_ID,
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
    render(<StrategyCanvas strategyId={STRATEGY_ID} versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    fireEvent.click(screen.getByRole("button", { name: /^validate$/i }));

    await waitFor(() => expect(validateSpy).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/issues detected/i)).toBeInTheDocument());
  });

  it("surfaces global validation issues without node context", async () => {
    const onVersionSwitch = vi.fn();
    validateSpy.mockResolvedValueOnce([
      { nodeId: null, code: "quota_exceeded", message: "Quota exceeded for broker nodes", severity: "error" }
    ]);

    render(<StrategyCanvas strategyId={STRATEGY_ID} versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    fireEvent.click(screen.getByRole("button", { name: /^validate$/i }));

    await waitFor(() => expect(validateSpy).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("canvas-global-issues")).toBeInTheDocument());
    expect(screen.getByText(/quota exceeded/i)).toBeInTheDocument();
  });

  it("invokes callbacks when loading versions", async () => {
    const onVersionSwitch = vi.fn();
    render(<StrategyCanvas strategyId={STRATEGY_ID} versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    fireEvent.click(screen.getByRole("button", { name: /Load/i }));

    await waitFor(() => expect(onVersionSwitch).toHaveBeenCalled());
  });

  it("shows revert success feedback", async () => {
    const onVersionSwitch = vi.fn();
    render(<StrategyCanvas strategyId={STRATEGY_ID} versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    fireEvent.click(screen.getByRole("button", { name: /Revert/i }));

    await waitFor(() => expect(revertSpy).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/Restored version/i)).toBeInTheDocument());
  });

  it("exposes undo/redo controls wired to history", async () => {
    const onVersionSwitch = vi.fn();
    useStrategyCanvas.getState().moveNode("version-1", "market", { x: 24, y: 18 });

    render(<StrategyCanvas strategyId={STRATEGY_ID} versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    const undoButton = screen.getByTestId("canvas-undo");
    expect(undoButton).not.toBeDisabled();

    fireEvent.click(undoButton);

    await waitFor(() => {
      const graph = useStrategyCanvas.getState().graphs["version-1"];
      expect(graph.nodes[0].position).toEqual({ x: 0, y: 0 });
    });

    const redoButton = screen.getByTestId("canvas-redo");
    await waitFor(() => expect(redoButton).not.toBeDisabled());

    fireEvent.click(redoButton);

    await waitFor(() => {
      const graph = useStrategyCanvas.getState().graphs["version-1"];
      expect(graph.nodes[0].position).toEqual({ x: 24, y: 18 });
    });
  });

  it("supports keyboard shortcuts for undo and redo", async () => {
    const onVersionSwitch = vi.fn();
    useStrategyCanvas.getState().moveNode("version-1", "market", { x: 12, y: 9 });

    render(<StrategyCanvas strategyId={STRATEGY_ID} versionId="version-1" onVersionSwitch={onVersionSwitch} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", metaKey: true }));
    });

    await waitFor(() => {
      const graph = useStrategyCanvas.getState().graphs["version-1"];
      expect(graph.nodes[0].position).toEqual({ x: 0, y: 0 });
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", shiftKey: true, metaKey: true }));
    });

    await waitFor(() => {
      const graph = useStrategyCanvas.getState().graphs["version-1"];
      expect(graph.nodes[0].position).toEqual({ x: 12, y: 9 });
    });
  });

  it("falls back to generated IDs when crypto.randomUUID is unavailable", async () => {
    const cryptoGlobal = globalThis.crypto as { randomUUID?: (() => string) | undefined };
    const originalRandomUUID = cryptoGlobal.randomUUID;
    cryptoGlobal.randomUUID = undefined;

    try {
      const onVersionSwitch = vi.fn();
      render(<StrategyCanvas strategyId={STRATEGY_ID} versionId="version-1" onVersionSwitch={onVersionSwitch} />);

      const surface = screen.getByTestId("canvas-surface");
      Object.defineProperty(surface, "getBoundingClientRect", {
        value: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }),
        configurable: true
      });

      const dataTransfer = {
        getData: (type: string) => (type === "application/x-canvas-block" ? "market-data" : "")
      };

      fireEvent.drop(surface, {
        clientX: 40,
        clientY: 40,
        dataTransfer
      });

      await waitFor(() => {
        const graph = useStrategyCanvas.getState().graphs["version-1"];
        expect(graph.nodes.some((node) => node.id.startsWith("market-data-"))).toBe(true);
      });
    } finally {
      cryptoGlobal.randomUUID = originalRandomUUID;
    }
  });
});
