import { expect, test } from "@playwright/test";

test("landing page explains the meal ticket loop on mobile", async ({ page }) => {
  // Given
  await page.setViewportSize({ width: 390, height: 844 });

  // When
  await page.goto("/");

  // Then
  await expect(
    page.getByRole("heading", {
      name: /adult adds 200 yen.*wall meal ticket.*warm curry without shame/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Start with 200 yen" })).toBeVisible();
  await expect(page.getByText(/does not include checkout credentials/i)).toBeVisible();
  await expect(page.getByText(/child identity fields/i)).toBeVisible();
});
