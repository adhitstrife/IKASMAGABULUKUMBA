'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Badge, Button, Card, Group, Loader, Select, Stack, Switch, Text, TextInput, Textarea } from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconCheck, IconPlus } from '@tabler/icons-react';
import type { EoEvent } from '@/types/eo';

type Category = { id: string; name: string };

function eventsFrom(payload: unknown): EoEvent[] {
  return Array.isArray(payload) ? payload as EoEvent[] : (payload as { data?: EoEvent[] })?.data ?? [];
}

export function EventList() {
  const [events, setEvents] = useState<EoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/eo/events').then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Daftar event gagal dimuat.');
      setEvents(eventsFrom(data));
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Daftar event gagal dimuat.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Group justify="center" py="xl"><Loader size="sm" /><Text c="dimmed">Memuat event...</Text></Group>;
  if (error) return <Alert color="red" icon={<IconAlertCircle size={18} />}>{error}</Alert>;
  if (!events.length) return <Card withBorder radius="lg" p="xl"><Stack align="center"><Text fw={700}>Belum ada event</Text><Text c="dimmed" size="sm">Buat event pertama untuk mulai menerima pendaftaran.</Text><Button component={Link} href="/eo/events/create" leftSection={<IconPlus size={17} />}>Buat event</Button></Stack></Card>;

  return <Stack gap="sm">{events.map((event) => <Card withBorder radius="lg" key={event.id}><Group justify="space-between" align="center"><div><Text fw={700}>{event.name}</Text><Text c="dimmed" size="sm">{event.description || 'Belum ada deskripsi'}</Text></div><Group><Badge color={event.status === 'active' ? 'teal' : 'gray'}>{event.status || 'draft'}</Badge><Button component={Link} href={`/eo/events/${event.id}`} variant="light" size="xs" rightSection={<IconArrowRight size={14} />}>Kelola</Button></Group></Group></Card>)}</Stack>;
}

export function CreateEventForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [allowTransfers, setAllowTransfers] = useState(false);
  const [allowRefunds, setAllowRefunds] = useState(false);
  const [editionName, setEditionName] = useState('');
  const [raceDate, setRaceDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/eo/categories').then((response) => response.json()).then((payload) => {
      const raw = Array.isArray(payload?.data) ? payload.data : [];
      setCategories(raw.map((category: Category) => ({ id: category.id, name: category.name })));
    }).catch(() => {});
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editionName || !raceDate || !location) return setError('Nama edisi, tanggal event, dan lokasi wajib diisi.');
    setError(null);
    setLoading(true);
    try {
      const createEvent = await fetch('/api/eo/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: description || undefined, capacity: capacity ? Number(capacity) : undefined, category_id: categoryId || undefined, allow_transfers: allowTransfers, allow_refunds: allowRefunds }) });
      const eventPayload = await createEvent.json();
      const createdEvent = eventPayload?.data ?? eventPayload;
      if (!createEvent.ok || !createdEvent?.id) throw new Error(eventPayload.error || eventPayload.message || 'Event gagal dibuat.');

      const addition = await fetch(`/api/eo/additions/events/${createdEvent.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editionName, race_date: new Date(raceDate).toISOString(), location }) });
      if (!addition.ok) {
        const additionPayload = await addition.json();
        throw new Error(additionPayload.error || additionPayload.message || 'Event dibuat, tetapi edisi pertama gagal dibuat.');
      }
      router.replace('/eo/events');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Event gagal dibuat.');
    } finally { setLoading(false); }
  };

  return <form onSubmit={submit}><Stack>{error && <Alert color="red" icon={<IconAlertCircle size={18} />}>{error}</Alert>}<TextInput label="Nama event" value={name} onChange={(event) => setName(event.currentTarget.value)} required placeholder="Contoh: Ikasma Fun Run 2026" /><Textarea label="Deskripsi" value={description} onChange={(event) => setDescription(event.currentTarget.value)} autosize minRows={3} /><TextInput label="Kapasitas" type="number" min="1" value={capacity} onChange={(event) => setCapacity(event.currentTarget.value)} /><Select label="Kategori" placeholder="Pilih kategori" data={categories.map((category) => ({ value: category.id, label: category.name }))} value={categoryId} onChange={setCategoryId} clearable /><Group grow><Switch label="Izinkan transfer tiket" checked={allowTransfers} onChange={(event) => setAllowTransfers(event.currentTarget.checked)} /><Switch label="Izinkan refund" checked={allowRefunds} onChange={(event) => setAllowRefunds(event.currentTarget.checked)} /></Group><Text fw={700} mt="sm">Edisi pertama</Text><TextInput label="Nama edisi" value={editionName} onChange={(event) => setEditionName(event.currentTarget.value)} required placeholder="Contoh: Race 2026" /><TextInput label="Tanggal event" type="datetime-local" value={raceDate} onChange={(event) => setRaceDate(event.currentTarget.value)} required /><TextInput label="Lokasi" value={location} onChange={(event) => setLocation(event.currentTarget.value)} required placeholder="Contoh: Lapangan Pemuda Bulukumba" /><Group justify="flex-end" mt="md"><Button component={Link} href="/eo/events" variant="default">Batal</Button><Button type="submit" loading={loading} leftSection={<IconCheck size={17} />}>Buat event dan edisi</Button></Group></Stack></form>;
}
