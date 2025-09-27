import { beforeEach, describe, expect, it } from "vitest";

import type { StrategyGraph } from "@strategybuilder/shared";

import { useStrategyCanvas } from "@/stores/useStrategyCanvas";

const STRATEGY_ID = "strategy-1";
const VERSION_ID = "version-1";

const baseGraph: StrategyGraph = {
  nodes: [
    {
      id: "market",
      label: "Market Data",
      type: "market-data",
      metadata: {
        parameters: { symbol: "BTC-USD", granularity: "5m" }
      },
      position: { x: 0, y: 0 }
    }
  ],
  edges: []
};

describe("useStrategyCanvas", () => {
  beforeEach(() => {
    useStrategyCanvas.getState().reset();
    useStrategyCanvas.getState().loadVersion({
      strategyId: STRATEGY_ID,
      versionId: VERSION_ID,
      graph: baseGraph,
      issues: []
    });
  });

  it("adds nodes and edges with undo/redo support", () => {
    expect(useStrategyCanvas.getState().graphs[VERSION_ID].nodes).toHaveLength(1);

    useStrategyCanvas.getState().upsertNode(VERSION_ID, {
      id: "momentum",
      label: "Momentum",
      type: "momentum-indicator",
      position: { x: 120, y: 160 },
      metadata: { parameters: { fastLength: 12, slowLength: 26 } }
    });

    expect(useStrategyCanvas.getState().graphs[VERSION_ID].nodes).toHaveLength(2);

    useStrategyCanvas.getState().connectNodes(VERSION_ID, {
      id: "edge-market-momentum",
      source: "market",
      target: "momentum"
    });

    expect(useStrategyCanvas.getState().graphs[VERSION_ID].edges).toHaveLength(1);

    useStrategyCanvas.getState().undo(VERSION_ID);
    expect(useStrategyCanvas.getState().graphs[VERSION_ID].edges).toHaveLength(0);

    useStrategyCanvas.getState().redo(VERSION_ID);
    expect(useStrategyCanvas.getState().graphs[VERSION_ID].edges).toHaveLength(1);
  });

  it("persists parameter updates", () => {
    useStrategyCanvas.getState().updateGraph(VERSION_ID, (graph) => {
      const node = graph.nodes[0];
      node.metadata = {
        ...(node.metadata ?? {}),
        parameters: {
          ...(node.metadata?.parameters ?? {}),
          symbol: "ETH-USD"
        }
      };
      return graph;
    });

    expect(useStrategyCanvas.getState().graphs[VERSION_ID].nodes[0].metadata?.parameters?.symbol).toBe(
      "ETH-USD"
    );
  });

  it("tracks validation states", () => {
    useStrategyCanvas.getState().markValidationPending(VERSION_ID);
    expect(useStrategyCanvas.getState().validation[VERSION_ID]?.status).toBe("pending");

    useStrategyCanvas.getState().setValidationResult(VERSION_ID, [
      { nodeId: "market", code: "missing_input", message: "Missing link", severity: "error" }
    ]);
    expect(useStrategyCanvas.getState().validation[VERSION_ID]?.status).toBe("idle");
    expect(useStrategyCanvas.getState().validation[VERSION_ID]?.issues).toHaveLength(1);

    useStrategyCanvas.getState().setValidationError(VERSION_ID, "Network error");
    expect(useStrategyCanvas.getState().validation[VERSION_ID]?.status).toBe("error");
  });
});
