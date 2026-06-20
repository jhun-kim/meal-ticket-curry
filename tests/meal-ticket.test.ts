import { describe, expect, it } from "vitest";
import { describeMealTicketLoop, makeYenAmount } from "../src/domain/meal-ticket";

describe("meal ticket loop", () => {
  it("describes the wall-ticket curry loop when an adult contributes 200 yen", () => {
    // Given
    const contribution = makeYenAmount(200);

    // When
    const loop = describeMealTicketLoop(contribution);

    // Then
    expect(loop).toEqual({
      adultContribution: {
        currency: "JPY",
        value: 200,
      },
      postedTicket: "wall meal ticket",
      mealOutcome: "child eats warm curry without shame",
    });
  });

  it("rejects non-positive yen amounts when creating a contribution", () => {
    // Given
    const invalidContribution = 0;

    // When
    const createContribution = () => makeYenAmount(invalidContribution);

    // Then
    expect(createContribution).toThrow(RangeError);
  });
});
