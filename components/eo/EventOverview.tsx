'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Badge, Box, Button, Card, Group, Loader, Paper, SimpleGrid, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconCalendarEvent, IconEdit, IconMapPin, IconTicket, IconUsers } from '@tabler/icons-react';
import { formatDate } from '@/lib/utils';
import type { EoAddition, EoEvent, EventStatistics } from '@/types/eo';

const dataOf = <T,>(payload: unknown): T => ((payload as { data?: T })?.data ?? payload) as T;

export function EventOverview({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EoEvent | null>(null);
  const [additions, setAdditions] = useState<EoAddition[]>([]);
  const [statistics, setStatistics] = useState<EventStatistics>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editionName, setEditionName] = useState('');
  const [raceDate, setRaceDate] = useState('');
  const [location, setLocation] = useState('');
  const [racepackPin, setRacepackPin] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [eventResponse, additionsResponse, statisticsResponse] = await Promise.all([
          fetch(`/api/eo/events/${eventId}`),
          fetch(`/api/eo/additions/events/${eventId}`),
          fetch(`/api/eo/events/${eventId}/statistics`),
        ]);
        const eventPayload = await eventResponse.json();
        if (!eventResponse.ok) throw new Error(eventPayload.error || 'Detail event tidak ditemukan.');
        setEvent(dataOf<EoEvent>(eventPayload));
        if (additionsResponse.ok) setAdditions(dataOf<EoAddition[]>(await additionsResponse.json()) || []);
        if (statisticsResponse.ok) setStatistics(dataOf<EventStatistics>(await statisticsResponse.json()) || {});
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Detail event gagal dimuat.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  if (loading) return <Box py={80} ta="center"><Loader /><Text c="dimmed" mt="sm">Memuat detail event...</Text></Box>;
  if (error || !event) return <Stack gap="lg"><Button component={Link} href="/eo/events" variant="subtle" leftSection={<IconArrowLeft size={16} />}>Kembali ke event</Button><Alert color="red" icon={<IconAlertCircle size={18} />}>{error || 'Event tidak ditemukan.'}</Alert></Stack>;

  const registrants = Number(statistics.confirmed_registrations ?? statistics.registrations_count ?? statistics.total_registrations ?? statistics.participants_count ?? 0);
  const statusColor = event.status === 'active' || event.status === 'published' ? 'teal' : 'gray';

  const addEdition = async () => {
    if (!editionName || !raceDate || !location) return setError('Nama edisi, tanggal event, dan lokasi wajib diisi.');
    if (racepackPin && !/^\d{6}$/.test(racepackPin)) return setError('PIN racepack harus terdiri dari 6 digit.');
    setAdding(true);
    try {
      const response = await fetch(`/api/eo/additions/events/${eventId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editionName, race_date: new Date(raceDate).toISOString(), location, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, racepack_pin: racepackPin || undefined }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || payload.message || 'Edisi gagal ditambahkan.');
      const created = dataOf<EoAddition>(payload);
      setAdditions((current) => [...current, created]);
      setEditionName(''); setRaceDate(''); setLocation(''); setRacepackPin('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Edisi gagal ditambahkan.'); }
    finally { setAdding(false); }
  };

  return <Stack gap="xl">
    <Group justify="space-between" align="start">
      <div>
        <Button component={Link} href="/eo/events" variant="subtle" px={0} leftSection={<IconArrowLeft size={16} />}>Semua event</Button>
        <Group gap="sm" mt="xs"><Title order={1}>{event.name}</Title><Badge color={statusColor}>{event.status || 'draft'}</Badge></Group>
        {event.description && <Text c="dimmed" mt="xs">{event.description}</Text>}
      </div>
      <Group><Button component={Link} href={`/eo/events/${eventId}/customize`} variant="light">Landing page</Button><Button component={Link} href={`/eo/events/${eventId}/settings`} leftSection={<IconEdit size={17} />}>Edit event</Button></Group>
    </Group>

    <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>
      <Stat icon={IconUsers} label="Registrasi" value={registrants} color="blue" />
      <Stat icon={IconTicket} label="Kapasitas" value={event.capacity ?? 0} color="violet" />
      <Stat icon={IconCalendarEvent} label="Jumlah edisi" value={additions.length} color="teal" />
    </SimpleGrid>

    <Paper withBorder radius="lg" p="lg">
      <Group justify="space-between" mb="lg"><div><Title order={3}>Edisi event</Title><Text c="dimmed" size="sm">Kelola tanggal, lokasi, dan tiket setiap edisi.</Text></div></Group>
       <Card withBorder radius="md" mb="md"><Stack><Text fw={600}>Tambah edisi</Text><Group grow align="end"><TextInput label="Nama edisi" value={editionName} onChange={(e) => setEditionName(e.currentTarget.value)} /><TextInput label="Tanggal event" type="datetime-local" value={raceDate} onChange={(e) => setRaceDate(e.currentTarget.value)} /><TextInput label="Lokasi" value={location} onChange={(e) => setLocation(e.currentTarget.value)} /></Group><TextInput label="PIN racepack" description="Opsional. Jika kosong, API akan membuat PIN otomatis." value={racepackPin} onChange={(e) => setRacepackPin(e.currentTarget.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} /><Button onClick={addEdition} loading={adding} variant="light" ml="auto">Tambah edisi</Button></Stack></Card>
      {!additions.length ? <Text c="dimmed" ta="center" py="xl">Belum ada edisi untuk event ini.</Text> : <Stack gap="sm">{additions.map((addition) => <Card withBorder radius="md" key={addition.id}><Group justify="space-between" wrap="nowrap"><div><Text fw={700}>{addition.name}</Text><Group gap="md" mt={4}><Text size="sm" c="dimmed">{addition.race_date ? formatDate(addition.race_date) : 'Tanggal belum diatur'}</Text>{addition.location && <Group gap={4}><IconMapPin size={14} color="#868e96" /><Text size="sm" c="dimmed">{addition.location}</Text></Group>}</Group></div><Group><Button component={Link} href={`/eo/events/${eventId}/additions/${addition.id}/edit`} variant="subtle" size="xs">Edit edisi</Button><Button component={Link} href={`/eo/events/${eventId}/additions/${addition.id}`} variant="light" size="xs">Kelola tiket</Button></Group></Group></Card>)}</Stack>}
    </Paper>
  </Stack>;
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof IconUsers; label: string; value: number; color: string }) {
  return <Paper withBorder radius="lg" p="lg"><Group><ThemeIcon size={42} radius="md" variant="light" color={color}><Icon size={21} /></ThemeIcon><div><Text size="sm" c="dimmed">{label}</Text><Text fw={800} size="xl">{value.toLocaleString('id-ID')}</Text></div></Group></Paper>;
}
