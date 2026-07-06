import { Badge, Text, Group } from '@mantine/core';
import { VARIANT_CONFIG, formatBonusSummary, isCommunityBonus } from '@/lib/pricing';
import type { TicketTypeVariant } from '@/types/ticket';

interface VariantBadgeProps {
  variant: TicketTypeVariant | undefined;
  bonusThreshold?: number | null;
  bonusQuantity?: number | null;
}

export default function VariantBadge({ variant, bonusThreshold, bonusQuantity }: VariantBadgeProps) {
  const cfg = VARIANT_CONFIG[variant ?? 'standard'];
  if (!cfg.showBadge) return null;

  const summary = variant === 'community' && bonusThreshold && bonusQuantity
    ? formatBonusSummary(bonusThreshold, bonusQuantity)
    : null;

  return (
    <Group gap={4} wrap="nowrap">
      <Badge color={cfg.color} size="sm" radius="xl" variant="light">
        {cfg.label}
      </Badge>
      {summary && (
        <Text size="xs" c="dimmed" fw={500}>
          {summary}
        </Text>
      )}
    </Group>
  );
}
