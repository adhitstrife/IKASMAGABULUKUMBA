'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Title, Text, Group, Button, Skeleton, Center, Stack, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconFlame, IconAlertCircle } from '@tabler/icons-react';
import { events } from '@/data/events';
import { EventCard } from './EventCard';

interface EventsData {
  data?: {
    events?: any[];
  };
}

export function UpcomingHighlight() {
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [transformedEvents, setTransformedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/events?key=${encodeURIComponent(process.env.NEXT_PUBLIC_ORG_SECRET_KEY || '')}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('Events data from API:', data);
        setEventsData(data);

        // Transform API events to match Event interface
        if (data?.data?.events && data.data.events.length > 0) {
          const transformed = data.data.events.map((apiEvent: any) => {
            const totalQuantitySold = apiEvent.latest_addition?.tickets?.reduce(
              (sum: number, ticket: any) => sum + (ticket.quantity_sold || 0),
              0
            ) || 0;
            const totalQuantity = apiEvent.latest_addition?.tickets?.reduce(
              (sum: number, ticket: any) => sum + (ticket.quantity || 0),
              0
            ) || 0;
            return {
              id: apiEvent.id,
              title: apiEvent.name,
              date: apiEvent.created_at,
              location: 'Bulukumba',
              isOnline: false,
              price: apiEvent.latest_addition?.tickets?.[0]?.price_cents || null,
              category: 'olahraga',
              image: apiEvent.image || 'https://images.unsplash.com/photo-1519703936-c4a3b3eb88e4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              description: apiEvent.description,
              isFeatured: true,
              seats: totalQuantity,
              registeredCount: totalQuantitySold,
              organizer: 'IKASMAGABULUKUMBA',
            };
          });
          setTransformedEvents(transformed);
        } else {
          setError('Tidak ada event yang tersedia saat ini');
        }
      } catch (error) {
        console.error('Error fetching events data:', error);
        setError('Gagal memuat data event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsData();
  }, []);

  // Use API events if available, otherwise fallback to local events
  const featured = transformedEvents.length > 0 
    ? transformedEvents.slice(0, 2)
    : events.filter((e) => e.isFeatured).slice(0, 2);

  return (
    <Box
      id="upcoming"
      py={80}
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <Container size="lg">
        {/* Section Header */}
        <Group justify="space-between" align="flex-end" mb="xl" wrap="wrap" gap="md">
          <Box>
            <Group gap="xs" mb={6}>
              <IconFlame size={18} color="#fa5252" />
              <Text
                size="sm"
                fw={700}
                tt="uppercase"
                c="red"
                style={{ letterSpacing: '0.6px' }}
              >
                Event Terdekat
              </Text>
            </Group>
            <Title order={2} style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
              Upcoming Highlight
            </Title>
            <Text c="dimmed" mt={6} size="sm">
              Event terbaru dan terpopuler yang tidak boleh kamu lewatkan
            </Text>
          </Box>
          <Button
            variant="subtle"
            rightSection={<IconArrowRight size={16} />}
            onClick={() =>
              document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Lihat Semua Event
          </Button>
        </Group>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {[1, 2].map((i) => (
              <Box key={i}>
                <Skeleton height={220} radius="xl" mb="md" />
                <Skeleton height={20} radius="md" mb="md" />
                <Skeleton height={16} radius="md" width="70%" />
              </Box>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Center py={80}>
            <Stack align="center" gap="md">
              <ThemeIcon size={72} radius="xl" variant="light" color="red">
                <IconAlertCircle size={36} />
              </ThemeIcon>
              <Title order={4} c="dimmed">
                {error}
              </Title>
            </Stack>
          </Center>
        )}

        {/* Featured Cards Grid */}
        {!loading && !error && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {featured.map((event) => (
              <EventCard key={event.id} event={event} featured />
            ))}
          </div>
        )}
      </Container>
    </Box>
  );
}
