'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Badge, Box, Button, Card, Group, Loader, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconCalendarEvent, IconCircleCheck, IconPlus, IconTicket, IconUsers } from '@tabler/icons-react';
import type { EoEvent, EoOrganization, EventStatistics } from '@/types/eo';
import { formatDate } from '@/lib/utils';

function extractEvents(payload: unknown): EoEvent[] {
  if (Array.isArray(payload)) return payload as EoEvent[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: EoEvent[] }).data;
  }
  return [];
}

function registrations(statistics: EventStatistics | undefined) {
  return Number(statistics?.confirmed_registrations ?? statistics?.registrations_count ?? statistics?.total_registrations ?? statistics?.participants_count ?? 0);
}

export function DashboardOverview() {
  const [organization, setOrganization] = useState<EoOrganization | null>(null);
  const [events, setEvents] = useState<EoEvent[]>([]);
  const [statistics, setStatistics] = useState<Record<string, EventStatistics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [organizationResponse, eventsResponse] = await Promise.all([
          fetch('/api/eo/auth/me'),
          fetch('/api/eo/events'),
        ]);
        if (!organizationResponse.ok || !eventsResponse.ok) throw new Error('Dashboard belum dapat dimuat.');
        const organizationPayload = await organizationResponse.json();
        const eventsPayload = await eventsResponse.json();
        const eventList = extractEvents(eventsPayload);
        setOrganization((organizationPayload?.data ?? organizationPayload) as EoOrganization);
        setEvents(eventList);

        const statisticResults = await Promise.all(eventList.slice(0, 8).map(async (event) => {
          const response = await fetch(`/api/eo/events/${event.id}/statistics`);
          return [event.id, response.ok ? ((await response.json())?.data ?? await Promise.resolve({})) : {}] as const;
        }));
        setStatistics(Object.fromEntries(statisticResults) as Record<string, EventStatistics>);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Dashboard belum dapat dimuat.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Box py={80} ta="center"><Loader /><Text c="dimmed" mt="sm">Memuat data organisasi...</Text></Box>;
  if (error) return <Alert color="red" icon={<IconAlertCircle size={18} />} title="Data dashboard gagal dimuat">{error}</Alert>;

  const totalRegistrations = Object.values(statistics).reduce((total, item) => total + registrations(item), 0);
  const activeEvents = events.filter((event) => event.status === 'active' || event.status === 'published').length;
  const status = organization?.verification_status;

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="end">
        <div>
          <Text c="dimmed" size="sm">Selamat datang kembali</Text>
          <Title order={1}>{organization?.name || 'Organisasi Anda'}</Title>
          {status && <Badge mt={6} color={status === 'verified' ? 'green' : 'yellow'} variant="light">Status organisasi: {status}</Badge>}
        </div>
        <Button component={Link} href="/eo/events/create" leftSection={<IconPlus size={17} />}>Buat event</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }}>
        <Metric icon={IconCalendarEvent} label="Total event" value={events.length} color="blue" />
        <Metric icon={IconCircleCheck} label="Event aktif" value={activeEvents} color="teal" />
        <Metric icon={IconUsers} label="Registrasi tercatat" value={totalRegistrations} color="violet" />
      </SimpleGrid>

      <Paper withBorder radius="lg" p="lg">
        <Group justify="space-between" mb="lg">
          <div><Title order={3}>Event terbaru</Title><Text c="dimmed" size="sm">Pantau event dan aktivitas pendaftaran organisasi.</Text></div>
          <Button component={Link} href="/eo/events" variant="subtle" rightSection={<IconArrowRight size={16} />}>Lihat semua</Button>
        </Group>
        {events.length === 0 ? (
          <Stack align="center" py={36}><ThemeIcon size={48} radius="xl" variant="light"><IconTicket size={25} /></ThemeIcon><Text fw={600}>Belum ada event</Text><Text c="dimmed" size="sm" ta="center">Mulai dengan membuat event dan edisi pertama untuk organisasi Anda.</Text><Button component={Link} href="/eo/events/create" variant="light">Buat event pertama</Button></Stack>
        ) : <Stack gap="sm">{events.slice(0, 5).map((event) => <Card key={event.id} withBorder radius="md" padding="md"><Group justify="space-between" wrap="nowrap"><div><Text fw={700}>{event.name}</Text><Text size="sm" c="dimmed">{event.created_at ? `Dibuat ${formatDate(event.created_at)}` : 'Tanggal belum tersedia'}</Text></div><Group gap="sm" wrap="nowrap"><Text size="sm" c="dimmed">{registrations(statistics[event.id])} peserta</Text><Badge color={event.status === 'active' || event.status === 'published' ? 'teal' : 'gray'}>{event.status || 'draft'}</Badge></Group></Group></Card>)}</Stack>}
      </Paper>
    </Stack>
  );
}

function Metric({ icon: Icon, label, value, color }: { icon: typeof IconUsers; label: string; value: number; color: string }) {
  return <Paper withBorder radius="lg" p="lg"><Group><ThemeIcon size={42} radius="md" variant="light" color={color}><Icon size={22} /></ThemeIcon><div><Text c="dimmed" size="sm">{label}</Text><Text fw={800} size="xl">{value.toLocaleString('id-ID')}</Text></div></Group></Paper>;
}
