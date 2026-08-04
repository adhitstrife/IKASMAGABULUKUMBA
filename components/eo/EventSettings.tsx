'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, ColorInput, FileInput, Group, Loader, Select, Stack, Switch, TextInput, Textarea, Title } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

type EventData = {
  name?: string;
  description?: string;
  banner_url?: string;
  status?: string;
  allow_transfers?: boolean;
  allow_refunds?: boolean;
  refund_deadline?: string | null;
  race_pack_enabled?: boolean;
  race_pack_pickup_start?: string | null;
  race_pack_pickup_end?: string | null;
  category_id?: string | null;
  custom_fields?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

type Category = { id: string; name: string };

type Customization = {
  hero_image?: string;
  hero_title?: string;
  hero_subtitle?: string;
  primary_color?: string;
  secondary_color?: string;
  description_text?: string;
  cta_button_text?: string;
  cta_button_color?: string;
  show_ticket_types?: boolean;
  show_countdown?: boolean;
};

const dataOf = <T,>(value: unknown) => ((value as { data?: T })?.data ?? value) as T;
const dateInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function EventSettings({ eventId, customization = false }: { eventId: string; customization?: boolean }) {
  const [event, setEvent] = useState<EventData>({});
  const [custom, setCustom] = useState<Customization>({ primary_color: '#228be6', secondary_color: '#15aabf', cta_button_color: '#228be6', show_ticket_types: true, show_countdown: true });
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customFieldsInput, setCustomFieldsInput] = useState('{}');
  const [settingsInput, setSettingsInput] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const url = customization ? `/api/eo/landing-page/customization/${eventId}` : `/api/eo/events/${eventId}`;
    fetch(url)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Data event gagal dimuat.');
        if (customization) setCustom(dataOf<Customization>(payload));
        else {
          const eventData = dataOf<EventData>(payload);
          setEvent(eventData);
          setCustomFieldsInput(JSON.stringify(eventData.custom_fields || {}, null, 2));
          setSettingsInput(JSON.stringify(eventData.settings || {}, null, 2));
        }
      })
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [eventId, customization]);

  useEffect(() => {
    if (customization) return;
    fetch('/api/eo/categories')
      .then((response) => response.json())
      .then((payload) => setCategories(Array.isArray(payload?.data) ? payload.data : []))
      .catch(() => setCategories([]));
  }, [customization]);

  const updateEvent = (key: keyof EventData, value: string | boolean | null) => setEvent((current) => ({ ...current, [key]: value }));
  const updateCustom = (key: keyof Customization, value: string | boolean) => setCustom((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const uploadedHero = customization && heroFile ? await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(heroFile);
      }) : undefined;
      let customFields: Record<string, unknown> | undefined;
      let settings: Record<string, unknown> | undefined;
      if (!customization) {
        try {
          customFields = customFieldsInput.trim() ? JSON.parse(customFieldsInput) : {};
          settings = settingsInput.trim() ? JSON.parse(settingsInput) : {};
          if (Array.isArray(customFields) || Array.isArray(settings)) throw new Error('Custom fields dan settings harus berupa object JSON.');
        } catch (cause) {
          throw new Error(cause instanceof Error && cause.message.startsWith('Custom') ? cause.message : 'Custom fields dan settings harus berisi JSON object yang valid.');
        }
      }
      const payload = customization
        ? { ...custom, hero_image: uploadedHero || custom.hero_image }
        : {
          ...event,
          custom_fields: customFields,
          settings,
          refund_deadline: event.refund_deadline ? new Date(event.refund_deadline).toISOString() : null,
          race_pack_pickup_start: event.race_pack_pickup_start ? new Date(event.race_pack_pickup_start).toISOString() : null,
          race_pack_pickup_end: event.race_pack_pickup_end ? new Date(event.race_pack_pickup_end).toISOString() : null,
        };
      const response = await fetch(customization ? `/api/eo/landing-page/customization/${eventId}` : `/api/eo/events/${eventId}`, {
        method: customization ? 'PUT' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Perubahan gagal disimpan.');
      setHeroFile(null);
      setNotice('Perubahan berhasil disimpan.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Perubahan gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return <Stack>
    <Button component={Link} href={`/eo/events/${eventId}`} variant="subtle" px={0} leftSection={<IconArrowLeft size={16} />}>Kembali ke event</Button>
    <Title order={1}>{customization ? 'Kustomisasi landing page event' : 'Pengaturan event'}</Title>
    {error && <Alert color="red">{error}</Alert>}
    {notice && <Alert color="green">{notice}</Alert>}
    {customization ? <>
      <TextInput label="Judul hero" value={custom.hero_title || ''} onChange={(input) => updateCustom('hero_title', input.currentTarget.value)} />
      <Textarea label="Subjudul hero" value={custom.hero_subtitle || ''} onChange={(input) => updateCustom('hero_subtitle', input.currentTarget.value)} />
      <FileInput label="Upload gambar hero" description="JPEG atau PNG akan dikirim sebagai base64 sesuai kontrak API." accept="image/png,image/jpeg" value={heroFile} onChange={setHeroFile} />
      <TextInput label="URL gambar hero" value={custom.hero_image || ''} onChange={(input) => updateCustom('hero_image', input.currentTarget.value)} />
      <Group grow>
        <ColorInput label="Warna utama" value={custom.primary_color || '#228be6'} onChange={(value) => updateCustom('primary_color', value)} />
        <ColorInput label="Warna sekunder" value={custom.secondary_color || '#15aabf'} onChange={(value) => updateCustom('secondary_color', value)} />
        <ColorInput label="Warna CTA" value={custom.cta_button_color || '#228be6'} onChange={(value) => updateCustom('cta_button_color', value)} />
      </Group>
      <TextInput label="Teks CTA" value={custom.cta_button_text || ''} onChange={(input) => updateCustom('cta_button_text', input.currentTarget.value)} />
      <Textarea label="Deskripsi" value={custom.description_text || ''} onChange={(input) => updateCustom('description_text', input.currentTarget.value)} />
      <Group>
        <Switch label="Tampilkan jenis tiket" checked={custom.show_ticket_types ?? true} onChange={(input) => updateCustom('show_ticket_types', input.currentTarget.checked)} />
        <Switch label="Tampilkan countdown" checked={custom.show_countdown ?? true} onChange={(input) => updateCustom('show_countdown', input.currentTarget.checked)} />
      </Group>
    </> : <>
      <TextInput label="Nama event" value={event.name || ''} onChange={(input) => updateEvent('name', input.currentTarget.value)} />
      <Textarea label="Deskripsi" value={event.description || ''} onChange={(input) => updateEvent('description', input.currentTarget.value)} />
      <TextInput label="URL banner" value={event.banner_url || ''} onChange={(input) => updateEvent('banner_url', input.currentTarget.value)} />
      <Group grow>
        <Select label="Status" data={['draft', 'in_progress', 'active', 'completed', 'cancelled']} value={event.status || 'draft'} onChange={(value) => updateEvent('status', value || 'draft')} />
        <Select label="Kategori" placeholder="Pilih kategori" data={categories.map((category) => ({ value: category.id, label: category.name }))} value={event.category_id || null} onChange={(value) => updateEvent('category_id', value)} clearable />
      </Group>
      <Group>
        <Switch label="Izinkan transfer" checked={event.allow_transfers ?? false} onChange={(input) => updateEvent('allow_transfers', input.currentTarget.checked)} />
        <Switch label="Izinkan refund" checked={event.allow_refunds ?? false} onChange={(input) => updateEvent('allow_refunds', input.currentTarget.checked)} />
      </Group>
      <TextInput label="Batas refund" type="datetime-local" value={dateInput(event.refund_deadline)} onChange={(input) => updateEvent('refund_deadline', input.currentTarget.value || null)} />
      <Switch label="Aktifkan racepack" checked={event.race_pack_enabled ?? false} onChange={(input) => updateEvent('race_pack_enabled', input.currentTarget.checked)} />
      <Group grow>
        <TextInput label="Mulai pengambilan racepack" type="datetime-local" value={dateInput(event.race_pack_pickup_start)} onChange={(input) => updateEvent('race_pack_pickup_start', input.currentTarget.value || null)} />
        <TextInput label="Selesai pengambilan racepack" type="datetime-local" value={dateInput(event.race_pack_pickup_end)} onChange={(input) => updateEvent('race_pack_pickup_end', input.currentTarget.value || null)} />
      </Group>
      <Textarea label="Custom fields (JSON)" description={'Harus berupa JSON object, misalnya {"contact_email": "..."}.'} value={customFieldsInput} onChange={(input) => setCustomFieldsInput(input.currentTarget.value)} minRows={4} styles={{ input: { fontFamily: 'monospace' } }} />
      <Textarea label="Settings tambahan (JSON)" description="Harus berupa JSON object." value={settingsInput} onChange={(input) => setSettingsInput(input.currentTarget.value)} minRows={4} styles={{ input: { fontFamily: 'monospace' } }} />
    </>}
    <Button onClick={save} loading={saving} leftSection={<IconDeviceFloppy size={17} />}>Simpan perubahan</Button>
  </Stack>;
}
