'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Badge, Box, Button, Card, Divider, Group, Image, Loader, Modal, PinInput, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCamera, IconCheck, IconLogout, IconPackage } from '@tabler/icons-react';

type Addition = { id: string; name: string };
type Addon = { id: string; name: string; description?: string; price_per_unit?: number; catalog_price?: number; image_url?: string };
type Ticket = { id: string; qr_code?: string; participant_first_name?: string; participant_last_name?: string; t_shirt_size?: string; status?: string; addons?: Addon[] };
type Registration = { id: string; email?: string; phone?: string; id_number?: string; racepack_taken?: boolean; quantity?: number; tickets?: Ticket[] };
type Detector = { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
const list = <T,>(payload: unknown): T[] => Array.isArray((payload as { data?: unknown })?.data) ? (payload as { data: T[] }).data : [];
const participantName = (ticket: Ticket) => `${ticket.participant_first_name || ''} ${ticket.participant_last_name || ''}`.trim() || 'Peserta';
const rupiah = (value?: number) => `Rp${(value || 0).toLocaleString('id-ID')}`;

export function StaffLogin() {
  const router = useRouter(); const [additionId, setAdditionId] = useState(''); const [pin, setPin] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const login = async (event: FormEvent) => { event.preventDefault(); setLoading(true); setError(null); try { const response = await fetch('/api/racepack/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addition_id: additionId, pin }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Login staff gagal.'); sessionStorage.setItem('racepack_addition', JSON.stringify(data.addition)); router.replace('/racepack'); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Login staff gagal.'); } finally { setLoading(false); } };
  return <Box mih="100vh" py={64} style={{ background: '#f4f8fc' }}><Stack align="center"><ThemeIcon size={56} radius="xl"><IconPackage size={30} /></ThemeIcon><Title order={1}>Staff Racepack</Title><Text c="dimmed">Verifikasi pengambilan racepack peserta.</Text></Stack><Box mx="auto" mt="xl" maw={440}><Card withBorder p="xl" radius="lg"><form onSubmit={login}><Stack>{error && <Alert color="red" icon={<IconAlertCircle size={18} />}>{error}</Alert>}<TextInput label="ID edisi" description="Masukkan Addition ID yang diberikan oleh EO." value={additionId} onChange={(event) => setAdditionId(event.currentTarget.value)} required /><Text fw={500} size="sm">PIN racepack</Text><PinInput length={6} type="number" value={pin} onChange={setPin} oneTimeCode /><Button type="submit" loading={loading} disabled={!additionId || pin.length !== 6}>Masuk sebagai staff</Button></Stack></form></Card></Box></Box>;
}

export function StaffDashboard() {
  const router = useRouter();
  const [addition, setAddition] = useState<Addition | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [marking, setMarking] = useState(false);
  const [detailOpened, detailModal] = useDisclosure(false);
  const [scannerOpened, scannerModal] = useDisclosure(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => { const stored = sessionStorage.getItem('racepack_addition'); if (!stored) { router.replace('/racepack/login'); return; } setAddition(JSON.parse(stored)); }, [router]);
  const stopCamera = () => { if (timerRef.current) window.clearInterval(timerRef.current); streamRef.current?.getTracks().forEach((track) => track.stop()); timerRef.current = null; streamRef.current = null; };
  useEffect(() => () => stopCamera(), []);

  const search = async (value = query) => {
    if (!addition) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/racepack/editions/${addition.id}/tickets?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tiket tidak ditemukan.');
      setRegistrations(list<Registration>(data));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pencarian tiket gagal.');
    } finally { setLoading(false); }
  };

  const openDetail = (registration: Registration) => { setSelected(registration); detailModal.open(); };

  const markTaken = async (registration: Registration) => {
    const ticketId = registration.tickets?.[0]?.id;
    if (!addition || !ticketId) return;
    if (!confirm(`Tandai racepack untuk ${registration.id_number || registration.email || 'registrasi ini'} sudah diambil?`)) return;
    setMarking(true);
    try {
      const response = await fetch(`/api/racepack/editions/${addition.id}/tickets/${ticketId}/mark-taken`, { method: 'PATCH' });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Racepack gagal ditandai.'); return; }
      detailModal.close();
      await search();
    } finally { setMarking(false); }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const DetectorClass = (window as Window & { BarcodeDetector?: new (options?: { formats?: string[] }) => Detector }).BarcodeDetector;
      if (!DetectorClass) { setCameraError('Browser belum mendukung scan QR otomatis. Gunakan kolom pencarian QR.'); return; }
      const detector = new DetectorClass({ formats: ['qr_code'] });
      timerRef.current = window.setInterval(async () => {
        if (!videoRef.current) return;
        const results = await detector.detect(videoRef.current).catch(() => []);
        if (results[0]?.rawValue) { stopCamera(); scannerModal.close(); setQuery(results[0].rawValue); search(results[0].rawValue); }
      }, 500);
    } catch { setCameraError('Kamera tidak dapat diakses. Izinkan kamera atau gunakan pencarian manual.'); }
  };

  const logout = async () => { stopCamera(); await fetch('/api/racepack/auth/logout', { method: 'POST' }); sessionStorage.removeItem('racepack_addition'); router.replace('/racepack/login'); };

  if (!addition) return <Box py={80} ta="center"><Loader /></Box>;

  return <Box p={{ base: 'md', sm: 'xl' }} maw={900} mx="auto">
    <Stack>
      <Group justify="space-between">
        <div><Title order={1}>{addition.name}</Title><Text c="dimmed">Portal verifikasi racepack</Text></div>
        <Button color="gray" variant="light" leftSection={<IconLogout size={16} />} onClick={logout}>Keluar</Button>
      </Group>
      {error && <Alert color="red">{error}</Alert>}
      <Group align="end">
        <TextInput label="Cari tiket" placeholder="QR, nama, BIB, email, telepon, atau ID" value={query} onChange={(event) => setQuery(event.currentTarget.value)} style={{ flex: 1 }} />
        <Button onClick={() => search()}>Cari</Button>
        <Button variant="light" leftSection={<IconCamera size={16} />} onClick={() => { scannerModal.open(); setTimeout(() => { void startCamera(); }, 0); }}>Scan QR</Button>
      </Group>
      {loading ? <Loader /> : registrations.map((registration) => {
        const ticketCount = registration.tickets?.length ?? registration.quantity ?? 0;
        return <Card key={registration.id} withBorder>
          <Group justify="space-between" align="center" wrap="nowrap">
            <div>
              <Text fw={700}>{registration.id_number || registration.email || 'Registrasi'}</Text>
              <Text size="sm" c="dimmed">{registration.email || '-'} · {registration.phone || '-'} · {ticketCount} tiket</Text>
            </div>
            <Group gap="xs">
              <Badge color={registration.racepack_taken ? 'gray' : 'teal'}>{registration.racepack_taken ? 'Sudah diambil' : 'Belum diambil'}</Badge>
              <Button size="xs" variant="light" onClick={() => openDetail(registration)}>Detail</Button>
            </Group>
          </Group>
        </Card>;
      })}
      {!loading && !registrations.length && <Text c="dimmed" ta="center" py="xl">Cari tiket dengan QR atau data peserta untuk memulai verifikasi.</Text>}

      <Modal opened={detailOpened} onClose={detailModal.close} title="Detail registrasi" size="lg">
        <Stack>
          <div>
            <Text fw={700}>{selected?.id_number || selected?.email || '-'}</Text>
            <Text size="sm" c="dimmed">Email: {selected?.email || '-'} · Telepon: {selected?.phone || '-'}</Text>
            <Text size="sm" c="dimmed">Jumlah tiket: {selected?.quantity ?? selected?.tickets?.length ?? 0}</Text>
          </div>
          <Divider label="Tiket & peserta" />
          <Stack gap="md">
            {(selected?.tickets || []).map((ticket) => <Card key={ticket.id} withBorder radius="md" padding="sm">
              <Text fw={600}>{participantName(ticket)}</Text>
              <Text size="sm" c="dimmed">Kaos {ticket.t_shirt_size || '-'} · QR {ticket.qr_code || ticket.id}</Text>
              {ticket.addons && ticket.addons.length > 0 && <Stack gap="xs" mt="sm">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">Add-on</Text>
                {ticket.addons.map((addon) => <Group key={addon.id} gap="sm" wrap="nowrap">
                  {addon.image_url && <Image src={addon.image_url} alt={addon.name} w={40} h={40} radius="sm" fit="cover" />}
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>{addon.name}</Text>
                    {addon.description && <Text size="xs" c="dimmed">{addon.description}</Text>}
                  </div>
                  <Text size="sm" fw={500}>{rupiah(addon.price_per_unit ?? addon.catalog_price)}</Text>
                </Group>)}
              </Stack>}
            </Card>)}
          </Stack>
          {selected?.racepack_taken
            ? <Alert color="yellow">Racepack registrasi ini sudah diambil.</Alert>
            : <Button color="teal" loading={marking} leftSection={<IconCheck size={17} />} onClick={() => selected && markTaken(selected)}>Tandai racepack diambil</Button>}
        </Stack>
      </Modal>

      <Modal opened={scannerOpened} onClose={() => { stopCamera(); scannerModal.close(); }} title="Scan QR tiket">
        <Stack>
          <video ref={videoRef} muted playsInline style={{ width: '100%', borderRadius: 8, background: '#000' }} />
          {cameraError && <Alert color="yellow">{cameraError}</Alert>}
        </Stack>
      </Modal>
    </Stack>
  </Box>;
}
