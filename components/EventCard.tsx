'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Badge,
  Button,
  Text,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconWifi,
  IconUsers,
  IconShare2,
} from '@tabler/icons-react';
import { Event, CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/events';
import { formatDate, formatPrice, getSeatPercent } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const router = useRouter();
  const seatPercent = getSeatPercent(event.registeredCount, event.seats);
  const isAlmostFull = seatPercent >= 80;

  const handleDetailClick = () => {
    router.push(`/events/${event.id}`);
  };

  const handleDaftarClick = () => {
    router.push(`/events/${event.id}`);
  };

  const handleShare = async () => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const shareText = `Yuk daftar event "${event.title}" di IKASMAGABULUKUMBA!`;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: eventUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or error:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const textToCopy = `${shareText}\n${eventUrl}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        alert('Link event disalin ke clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <Card
      shadow="sm"
      radius="xl"
      padding={0}
      style={{
        overflow: 'hidden',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        backgroundColor: 'white',
        border: '1px solid #f1f3f5',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 16px 48px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      {/* Image */}
      <Box style={{ position: 'relative', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={event.title}
          style={{
            width: '100%',
            height: featured ? 220 : 180,
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Category badge */}
        <Box style={{ position: 'absolute', top: 12, left: 12 }}>
          <Badge
            color={CATEGORY_COLORS[event.category]}
            size="sm"
            radius="xl"
            fw={600}
          >
            {CATEGORY_LABELS[event.category]}
          </Badge>
        </Box>
        {/* Online badge */}
        {event.isOnline && (
          <Box style={{ position: 'absolute', top: 12, right: 12 }}>
            <Badge color="cyan" size="sm" radius="xl" leftSection={<IconWifi size={10} />}>
              Online
            </Badge>
          </Box>
        )}
        {/* Almost full warning */}
        {isAlmostFull && !event.isOnline && (
          <Box style={{ position: 'absolute', top: 12, right: 12 }}>
            <Badge color="red" size="sm" radius="xl">
              Hampir Penuh!
            </Badge>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box p="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack gap="xs" style={{ flex: 1 }}>
          <Text fw={700} size={featured ? 'lg' : 'md'} lineClamp={2} style={{ lineHeight: 1.35 }}>
            {event.title}
          </Text>

          <Group gap={6} c="dimmed">
            <IconCalendar size={14} style={{ flexShrink: 0 }} />
            <Text size="xs">{formatDate(event.date)}</Text>
          </Group>

          <Group gap={6} c="dimmed">
            <IconMapPin size={14} style={{ flexShrink: 0 }} />
            <Text size="xs" lineClamp={1}>
              {event.location}
            </Text>
          </Group>

          {featured && (
            <Text size="sm" c="dimmed" lineClamp={2} mt={2}>
              {event.description}
            </Text>
          )}

          {/* Seat progress bar */}
          <Box mt="auto" pt="sm">
            <Group justify="space-between" mb={5}>
              <Group gap={4} c="dimmed">
                <IconUsers size={12} />
                <Text size="xs">{event.registeredCount}/{event.seats} terdaftar</Text>
              </Group>
              <Text size="xs" fw={600} c={isAlmostFull ? 'red' : 'blue'}>
                {seatPercent}%
              </Text>
            </Group>
            <Box
              style={{
                height: 5,
                backgroundColor: '#e9ecef',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  height: '100%',
                  width: `${seatPercent}%`,
                  backgroundColor: isAlmostFull ? '#fa5252' : '#228be6',
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }}
              />
            </Box>
          </Box>
        </Stack>

        {/* Footer row */}
        <Group justify="space-between" align="center" mt="md">
          <Text
            fw={700}
            size={featured ? 'lg' : 'md'}
            c={event.price === null ? 'green' : 'dark'}
          >
            {formatPrice(event.price)}
          </Text>
          <Group gap="xs">
            <Tooltip label="Bagikan event" position="top">
              <ActionIcon
                size="md"
                radius="xl"
                variant="light"
                onClick={handleShare}
                aria-label="Share event"
              >
                <IconShare2 size={16} />
              </ActionIcon>
            </Tooltip>
            <Button size="xs" radius="xl" onClick={handleDaftarClick}>
              Daftar
            </Button>
          </Group>
        </Group>
      </Box>
    </Card>
  );
}
