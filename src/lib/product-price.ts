export function previousAmountError(
  previousAmount: number | null,
  sellingAmount: number,
): string | null {
  if (previousAmount == null) {
    return null;
  }

  if (!Number.isFinite(previousAmount) || previousAmount <= sellingAmount) {
    return "Previous price must be higher than the selling price.";
  }

  return null;
}

export function readPreviousAmount(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}
