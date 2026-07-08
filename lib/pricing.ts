import type { TicketTypeAddon, TicketTypeVariant } from "@/types/ticket";

export function computeAddonsTotalIdr(
  selected: Set<string>[],
  available: TicketTypeAddon[],
): number {
  const priceById = new Map(available.map((a) => [a.id, a.price]));
  let total = 0;
  for (const set of selected) {
    Array.from(set).forEach((id) => {
      total += priceById.get(id) ?? 0;
    });
  }
  return total;
}

export function computeAddonsTotalCents(
  selected: Set<string>[],
  available: TicketTypeAddon[],
): number {
  return computeAddonsTotalIdr(selected, available);
}

export function buildPurchaseTicketsPayload(
  participants: Array<{ bib_name: string; shirt_size: string }>,
  selected: Set<string>[],
): Array<{ bib_name: string; shirt_size: string; addons: { addon_id: string }[] }> {
  return participants.map((p, i) => ({
    bib_name: p.bib_name,
    shirt_size: p.shirt_size,
    addons: Array.from(selected[i] ?? new Set<string>()).map((addon_id) => ({
      addon_id,
    })),
  }));
}

export function getBonusPreview(
  paidQuantity: number,
  bonusThreshold: number | null | undefined,
  bonusQuantity: number | null | undefined,
): { free: number; total: number } {
  if (!bonusThreshold || !bonusQuantity || bonusThreshold < 1) {
    return { free: 0, total: paidQuantity };
  }
  const free = Math.floor(paidQuantity / bonusThreshold) * bonusQuantity;
  return { free, total: paidQuantity + free };
}

export function isCommunityBonus(
  variant: TicketTypeVariant | string | undefined,
): boolean {
  return variant === 'community';
}

export function formatBonusSummary(
  bonusThreshold: number | null,
  bonusQuantity: number | null,
): string {
  if (!bonusThreshold || !bonusQuantity) return '';
  return `Beli ${bonusThreshold} gratis ${bonusQuantity}`;
}

export function clampQuantity(
  qty: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(qty)) return min;
  return Math.max(min, Math.min(max, Math.floor(qty)));
}

export function getEffectiveMaxPerOrder(
  maxPerOrder: number | null | undefined,
  totalQuantity: number,
  quantitySold: number,
): number {
  const stock = Math.max(0, totalQuantity - quantitySold);
  if (maxPerOrder != null && maxPerOrder > 0) {
    return Math.min(maxPerOrder, stock);
  }
  return stock;
}

export const VARIANT_CONFIG: Record<TicketTypeVariant, {
  label: string;
  color: string;
  showBadge: boolean;
}> = {
  standard:  { label: '',          color: 'gray',  showBadge: false },
  student:   { label: 'Siswa',     color: 'blue',  showBadge: true  },
  community: { label: 'Komunitas', color: 'green', showBadge: true  },
};
