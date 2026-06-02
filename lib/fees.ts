export interface FeeTier {
  minAmount: number;
  maxAmount: number | null;
  feeType: "fixed" | "percent";
  feeValue: number;
  order: number;
}

export const DEFAULT_FEE_TIERS: FeeTier[] = [
  { minAmount: 0,    maxAmount: 500,   feeType: "fixed",   feeValue: 15,  order: 1 },
  { minAmount: 501,  maxAmount: 2000,  feeType: "fixed",   feeValue: 30,  order: 2 },
  { minAmount: 2001, maxAmount: 5000,  feeType: "percent", feeValue: 2,   order: 3 },
  { minAmount: 5001, maxAmount: null,  feeType: "percent", feeValue: 1.5, order: 4 },
];

export function calculateFee(amount: number, tiers: FeeTier[] = DEFAULT_FEE_TIERS): number {
  const tier = [...tiers]
    .sort((a, b) => a.order - b.order)
    .find((t) => amount >= t.minAmount && (t.maxAmount === null || amount <= t.maxAmount));
  if (!tier) return 0;
  if (tier.feeType === "fixed") return tier.feeValue;
  return Math.round(amount * tier.feeValue / 100 * 100) / 100;
}

export function formatFeeDescription(tier: FeeTier): string {
  const range = tier.maxAmount
    ? `฿${tier.minAmount.toLocaleString()}–฿${tier.maxAmount.toLocaleString()}`
    : `฿${tier.minAmount.toLocaleString()}+`;
  const fee = tier.feeType === "fixed" ? `฿${tier.feeValue}` : `${tier.feeValue}%`;
  return `${range} → ${fee}`;
}
