// Money is stored in the database as NUMERIC(10,2) and passed around the
// app as plain numbers of dollars/cents. All arithmetic goes through
// integer cents so we never accumulate floating-point rounding errors.

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export function sumCents(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + toCents(amount), 0);
}

export function formatMoney(amount: number, currencySymbol = "$"): string {
  return `${currencySymbol}${fromCents(toCents(amount)).toFixed(2)}`;
}
