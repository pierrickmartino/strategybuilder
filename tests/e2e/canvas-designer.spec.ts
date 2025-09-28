import { expect, test } from "@playwright/test";

test.describe("Strategy canvas designer", () => {
  test("supports block drag/drop, inline validation, and version rollback", async ({ page }) => {
    await page.goto("/en/strategies/demo/designer");

    const paletteBlock = page.getByRole("button", { name: "Momentum Indicator" });
    const canvasSurface = page.getByTestId("canvas-surface");

    // Drag and drop a momentum indicator block onto the canvas
    await paletteBlock.dragTo(canvasSurface);

    // Trigger validation and verify inline feedback appears
    await page.getByRole("button", { name: "Validate" }).click();
    await expect(page.getByText(/issues detected/i)).toBeVisible();

    // Open version history and revert to the seeded version
    await page.getByRole("button", { name: "Revert" }).first().click();
    await expect(page.getByText(/Restored version/i)).toBeVisible();
  });
});
