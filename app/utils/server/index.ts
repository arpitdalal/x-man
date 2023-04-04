export function sanitizeAmount(amount: string) {
  return amount.replace(/[^0-9.]/g, "");
}
