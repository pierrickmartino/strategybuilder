import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { NodeProps } from "@xyflow/react";

import { CanvasNode, type CanvasNodeData } from "@/components/canvas/CanvasNode";

function renderNode(data: CanvasNodeData, selected = false) {
  const props = { data, selected } as unknown as NodeProps<CanvasNodeData>;
  return render(<CanvasNode {...props} />);
}

describe("CanvasNode", () => {
  it("shows error badge when issues contain errors", () => {
    renderNode({ label: "Momentum", kind: "indicator", issues: [{ nodeId: "n1", code: "missing", message: "Missing input", severity: "error" }] });
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Missing input")).toBeInTheDocument();
  });

  it("shows warning badge when only warnings are present", () => {
    renderNode({ label: "Risk", kind: "risk", issues: [{ nodeId: "n2", code: "warn", message: "Review config", severity: "warning" }] });
    expect(screen.getByText("Check")).toBeInTheDocument();
  });
});

