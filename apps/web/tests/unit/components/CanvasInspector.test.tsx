import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanvasInspector } from "@/components/canvas/CanvasInspector";

const node = {
  id: "momentum",
  label: "Momentum Indicator",
  type: "momentum-indicator",
  position: { x: 0, y: 0 },
  metadata: {
    parameters: {
      fastLength: 12,
      slowLength: 26
    },
    description: "Calculates EMA crossover"
  }
};

describe("CanvasInspector", () => {
  it("renders parameter controls and dispatches updates", () => {
    const handler = vi.fn();
    render(<CanvasInspector node={node} onUpdate={handler} />);

    const fastInput = screen.getByLabelText("Fast Window");
    fireEvent.change(fastInput, { target: { value: "18" } });

    expect(handler).toHaveBeenCalledWith("fastLength", 18);
  });

  it("shows placeholder when no node selected", () => {
    render(<CanvasInspector node={null} onUpdate={() => undefined} />);
    expect(screen.getByText(/Select a block/i)).toBeInTheDocument();
  });
});

