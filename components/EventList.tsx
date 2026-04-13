'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Title,
  Text,
  Group,
  Stack,
  TextInput,
  Select,
  Badge,
  Button,
  SimpleGrid,
  Center,
  ThemeIcon,
} from '@mantine/core';
import {
  IconSearch,
  IconAdjustments,
  IconX,
  IconCalendarOff,
} from '@tabler/icons-react';
import { events, CATEGORY_OPTIONS, EventCategory } from '@/data/events';
import { EventCard } from './EventCard';

const ALL_CATEGORY_OPTIONS = [
  { value: 'all', label: 'Semua Kategori' },
  ...CATEGORY_OPTIONS,
];

const DATE_OPTIONS = [
  { value: 'all', label: 'Semua Waktu' },
  { value: 'this-month', label: 'Bulan Ini' },
  { value: 'next-month', label: 'Bulan Depan' },
  { value: 'future', label: '3 Bulan Ke Depan' },
];

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Tanggal Terdekat' },
  { value: 'date-desc', label: 'Tanggal Terjauh' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'seats-asc', label: 'Kursi Tersedia' },
];

export function EventList() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sort, setSort] = useState('date-asc');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [transformedEvents, setTransformedEvents] = useState(events);

  // Fetch events from API on mount
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const url = `/api/events?key=${encodeURIComponent(process.env.NEXT_PUBLIC_ORG_SECRET_KEY || '')}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('Events data from API:', data);

        // Transform API events to match Event interface
        if (data?.data?.events) {
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
              isFeatured: false,
              seats: totalQuantity,
              registeredCount: totalQuantitySold,
              organizer: 'IKASMAGABULUKUMBA',
            };
          });
          setTransformedEvents(transformed);
        }
      } catch (error) {
        console.error('Error fetching events data:', error);
        // Fallback to local events
        setTransformedEvents(events);
      }
    };

    fetchEventsData();
  }, []);

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'all' ||
    dateFilter !== 'all' ||
    showOnlineOnly ||
    showFreeOnly;

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setDateFilter('all');
    setSort('date-asc');
    setShowOnlineOnly(false);
    setShowFreeOnly(false);
  };

  const filtered = useMemo(() => {
    let result = [...transformedEvents];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== 'all') {
      result = result.filter((e) => e.category === (category as EventCategory));
    }

    // Online only
    if (showOnlineOnly) {
      result = result.filter((e) => e.isOnline);
    }

    // Free only
    if (showFreeOnly) {
      result = result.filter((e) => e.price === null);
    }

    // Date filter
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (dateFilter === 'this-month') {
      result = result.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    } else if (dateFilter === 'next-month') {
      const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      result = result.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === nm.getMonth() && d.getFullYear() === nm.getFullYear()
        );
      });
    } else if (dateFilter === 'future') {
      const threeMonths = new Date(now);
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      result = result.filter((e) => {
        const d = new Date(e.date);
        return d >= now && d <= threeMonths;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'price-asc':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price-desc':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'seats-asc':
          return (
            a.seats - a.registeredCount - (b.seats - b.registeredCount)
          );
        default:
          return 0;
      }
    });

    return result;
  }, [search, category, dateFilter, sort, showOnlineOnly, showFreeOnly, transformedEvents]);

  return (
    <Box id="events" py={80} style={{ backgroundColor: 'white' }}>
      <Container size="lg">
        {/* Section Header */}
        <Box mb="xl" ta="center">
          <Text
            size="sm"
            fw={700}
            tt="uppercase"
            c="blue"
            mb={6}
            style={{ letterSpacing: '0.6px' }}
          >
            Semua Event
          </Text>
          <Title order={2} style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
            Temukan Event yang Tepat Untukmu
          </Title>
          <Text c="dimmed" mt={6} size="sm" maw={440} mx="auto">
            Cari dan filter event berdasarkan kategori, tanggal, atau format
          </Text>
        </Box>

        {/* Search & Filter Box */}
        <Box
          p="lg"
          mb="xl"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 20,
            border: '1px solid #e9ecef',
          }}
        >
          <Stack gap="md">
            {/* Search input */}
            <TextInput
              placeholder="Cari nama event, lokasi, atau penyelenggara..."
              leftSection={<IconSearch size={18} />}
              size="md"
              radius="xl"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              rightSection={
                search ? (
                  <IconX
                    size={16}
                    style={{ cursor: 'pointer', color: '#868e96' }}
                    onClick={() => setSearch('')}
                  />
                ) : null
              }
              styles={{
                input: { backgroundColor: 'white' },
              }}
            />

            {/* Filter row */}
            <Group gap="sm" wrap="wrap" align="center">
              <Group gap={6}>
                <IconAdjustments size={16} color="#868e96" />
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.4px' }}>
                  Filter:
                </Text>
              </Group>

              <Select
                placeholder="Kategori"
                data={ALL_CATEGORY_OPTIONS}
                value={category}
                onChange={(val) => setCategory(val ?? 'all')}
                size="sm"
                radius="xl"
                style={{ minWidth: 155 }}
                styles={{ input: { backgroundColor: 'white' } }}
              />
              <Select
                placeholder="Waktu"
                data={DATE_OPTIONS}
                value={dateFilter}
                onChange={(val) => setDateFilter(val ?? 'all')}
                size="sm"
                radius="xl"
                style={{ minWidth: 160 }}
                styles={{ input: { backgroundColor: 'white' } }}
              />
              <Select
                placeholder="Urutkan"
                data={SORT_OPTIONS}
                value={sort}
                onChange={(val) => setSort(val ?? 'date-asc')}
                size="sm"
                radius="xl"
                style={{ minWidth: 175 }}
                styles={{ input: { backgroundColor: 'white' } }}
              />

              {/* Toggle badges */}
              <Badge
                variant={showOnlineOnly ? 'filled' : 'outline'}
                color="cyan"
                size="lg"
                radius="xl"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setShowOnlineOnly((v) => !v)}
              >
                Online
              </Badge>
              <Badge
                variant={showFreeOnly ? 'filled' : 'outline'}
                color="green"
                size="lg"
                radius="xl"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setShowFreeOnly((v) => !v)}
              >
                Gratis
              </Badge>

              {hasActiveFilters && (
                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  radius="xl"
                  rightSection={<IconX size={13} />}
                  onClick={clearFilters}
                >
                  Reset Filter
                </Button>
              )}
            </Group>
          </Stack>
        </Box>

        {/* Result count */}
        <Group justify="space-between" mb="lg">
          <Text size="sm" c="dimmed">
            Menampilkan{' '}
            <Text component="span" fw={700} c="dark" size="sm">
              {filtered.length}
            </Text>{' '}
            dari {transformedEvents.length} event
          </Text>
          {hasActiveFilters && (
            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
              Filter aktif
            </Text>
          )}
        </Group>

        {/* Event Grid */}
        {filtered.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </SimpleGrid>
        ) : (
          <Center py={80}>
            <Stack align="center" gap="md">
              <ThemeIcon size={72} radius="xl" variant="light" color="gray">
                <IconCalendarOff size={36} />
              </ThemeIcon>
              <Title order={4} c="dimmed">
                Tidak ada event ditemukan
              </Title>
              <Text c="dimmed" ta="center" maw={300} size="sm">
                Coba ubah filter, kata kunci, atau hapus beberapa opsi yang aktif
              </Text>
              <Button variant="light" radius="xl" onClick={clearFilters}>
                Reset Semua Filter
              </Button>
            </Stack>
          </Center>
        )}
      </Container>
    </Box>
  );
}
