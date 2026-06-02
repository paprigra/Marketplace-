import { prisma } from "./db";
import { FeeTier, DEFAULT_FEE_TIERS } from "./fees";

export async function getFeeTiers(): Promise<FeeTier[]> {
  try {
    const tiers = await prisma.feeConfig.findMany({ orderBy: { order: "asc" } });
    if (tiers.length === 0) return DEFAULT_FEE_TIERS;
    return tiers as FeeTier[];
  } catch {
    return DEFAULT_FEE_TIERS;
  }
}
