export type YenAmount = Readonly<{
  currency: "JPY";
  value: number;
}>;

export type MealTicketLoop = {
  readonly adultContribution: YenAmount;
  readonly postedTicket: string;
  readonly mealOutcome: string;
};

export function makeYenAmount(value: number): YenAmount {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError("Yen amount must be a positive integer.");
  }

  return {
    currency: "JPY",
    value,
  };
}

export function describeMealTicketLoop(adultContribution: YenAmount): MealTicketLoop {
  return {
    adultContribution,
    postedTicket: "wall meal ticket",
    mealOutcome: "child eats warm curry without shame",
  };
}
