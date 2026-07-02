import { Checkbox, Stack, Text, Group, Badge } from '@mantine/core';
import type { TicketTypeAddon } from '@/types/ticket';

interface AddonPickerProps {
  addons: TicketTypeAddon[];
  selectedAddonIds: Set<string>;
  onToggle: (addonId: string) => void;
}

export default function AddonPicker({ addons, selectedAddonIds, onToggle }: AddonPickerProps) {
  if (addons.length === 0) return null;

  return (
    <Stack gap="xs">
      {addons.map((addon) => {
        const isSelected = selectedAddonIds.has(addon.id);
        const isSoldOut =
          addon.max_quantity !== null && addon.quantity_sold >= addon.max_quantity;

        return (
          <Group key={addon.id} gap="xs" wrap="nowrap" style={{ cursor: isSoldOut ? 'not-allowed' : 'pointer' }}>
            <Checkbox
              checked={isSelected}
              disabled={isSoldOut}
              onChange={() => onToggle(addon.id)}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} style={{ lineHeight: 1.4 }}>
                {addon.name}
                {addon.description && (
                  <Text component="span" size="xs" c="dimmed" ml={4}>
                    — {addon.description}
                  </Text>
                )}
              </Text>
            </div>
            <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
              <Text size="sm" fw={700} c="blue">
                + Rp {addon.price.toLocaleString('id-ID')}
              </Text>
              {isSoldOut && (
                <Badge color="red" size="sm" variant="light" radius="sm">
                  Habis
                </Badge>
              )}
            </Group>
          </Group>
        );
      })}
    </Stack>
  );
}
