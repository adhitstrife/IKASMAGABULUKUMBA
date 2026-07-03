import type { TicketTypeAddon } from "@/types/ticket";

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

export function buildPurchaseTicketsPayload<T>(
  participants: T[],
  selected: Set<string>[],
): (T & { addons: { addon_id: string }[] })[] {
  return participants.map((p, i) => ({
    ...p,
    addons: Array.from(selected[i] ?? new Set<string>()).map((addon_id) => ({
      addon_id,
    })),
  }));
}
