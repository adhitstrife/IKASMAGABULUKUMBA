'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Checkbox, Group, Loader, Modal, Select, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCamera, IconDownload, IconMail, IconPackage } from '@tabler/icons-react';

type ParticipantTicket = {
  id: string;
  participantFirstName?: string;
  participantLastName?: string;
  tShirtSize?: string;
  addons?: Array<{ name?: string; quantity?: number }>;
};

type Registration = {
  id: string;
  idNumber?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  quantity?: number;
  status?: string;
  racepack_taken?: boolean;
  racepackTaken?: boolean;
  ticketType?: string;
  ticket_type?: { name?: string };
  totalAmount?: number;
  platformFee?: number;
  paymentDate?: string;
  createdAt?: string;
  tickets?: ParticipantTicket[];
};

type Event = { id: string; name: string };
type Addition = { id: string; name: string };
type RacepackResult = { success?: boolean; type?: string; total?: number; sent?: number; failed?: number; failed_registration_ids?: string[] };
type BarcodeDetectorInstance = { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };

const list = <T,>(payload: unknown): T[] => Array.isArray((payload as { data?: unknown })?.data) ? (payload as { data: T[] }).data : Array.isArray(payload) ? payload as T[] : [];
const fullName = (registration: Registration) => `${registration.firstName ?? registration.first_name ?? ''} ${registration.lastName ?? registration.last_name ?? ''}`.trim() || 'Peserta';
const ticketName = (registration: Registration) => registration.ticketType ?? registration.ticket_type?.name ?? 'Tiket';
const racepackTaken = (registration: Registration) => registration.racepackTaken ?? registration.racepack_taken ?? false;

export function Participants() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [additionId, setAdditionId] = useState<string | null>(null);
  const [additions, setAdditions] = useState<Addition[]>([]);
  const [items, setItems] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Registration | null>(null);
  const [templates, setTemplates] = useState<string[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [scanValue, setScanValue] = useState('');
  const [notificationType, setNotificationType] = useState<'invitation' | 'reminder'>('invitation');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSending, setNotificationSending] = useState(false);
  const [notificationResult, setNotificationResult] = useState<RacepackResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [detailOpened, detailModal] = useDisclosure(false);
  const [templatesOpened, templateModal] = useDisclosure(false);
  const [scannerOpened, scannerModal] = useDisclosure(false);
  const [notificationOpened, notificationModal] = useDisclosure(false);

  const stopCamera = () => {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const showRegistration = (id: string) => {
    const registration = items.find((item) => item.id === id);
    if (!registration) {
      setError('ID registrasi tidak ditemukan pada daftar peserta saat ini. Ubah filter event atau edisi lalu coba lagi.');
      return;
    }
    stopCamera();
    scannerModal.close();
    setDetail(registration);
    detailModal.open();
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const Detector = (window as Window & { BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorInstance }).BarcodeDetector;
      if (!Detector) {
        setCameraError('Browser ini belum mendukung pemindaian QR otomatis. Masukkan ID registrasi secara manual di bawah.');
        return;
      }
      const detector = new Detector({ formats: ['qr_code'] });
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current) return;
        const codes = await detector.detect(videoRef.current).catch(() => []);
        if (codes[0]?.rawValue) showRegistration(codes[0].rawValue);
      }, 500);
    } catch {
      setCameraError('Kamera tidak dapat diakses. Izinkan kamera di browser atau masukkan ID registrasi manual.');
    }
  };

  useEffect(() => () => stopCamera(), []);
  useEffect(() => {
    fetch('/api/eo/events').then((response) => response.json()).then((payload) => {
      const eventList = list<Event>(payload);
      setEvents(eventList);
      if (eventList[0]) setEventId(eventList[0].id);
    });
  }, []);
  useEffect(() => {
    if (!eventId) return;
    setAdditionId(null);
    fetch(`/api/eo/additions/events/${eventId}`).then((response) => response.json()).then((payload) => setAdditions(list<Addition>(payload))).catch(() => setAdditions([]));
  }, [eventId]);

  const load = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (status && status !== 'all') query.set('status', status);
      if (additionId) query.set('addition_id', additionId);
      const response = await fetch(`/api/eo/events/${eventId}/registrations?${query}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Peserta gagal dimuat.');
      setItems(list<Registration>(payload));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Peserta gagal dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [eventId]);
  const action = async (id: string, type: 'invoice' | 'racepack') => {
    const path = type === 'invoice' ? `payments/registrations/${id}/resend-invoice` : `registrations/${id}/mark-racepack-taken`;
    const response = await fetch(`/api/eo/${path}`, { method: 'POST' });
    if (!response.ok) setError('Aksi gagal diproses.'); else load();
  };
  const notify = async () => {
    if (!eventId) return;
    setNotificationSending(true);
    setError(null);
    try {
      const eventResponse = await fetch(`/api/eo/events/${eventId}`);
      const eventPayload = await eventResponse.json();
      const event = eventPayload?.data ?? eventPayload;
      if (!eventResponse.ok || !event?.race_pack_enabled || !event?.race_pack_pickup_start || !event?.race_pack_pickup_end) throw new Error('Aktifkan racepack dan lengkapi jadwal pengambilan pada Pengaturan Event sebelum mengirim notifikasi.');
      const eligible = items.filter((item) => item.status === 'confirmed' && !racepackTaken(item));
      const registrationIds = selected.length ? selected : undefined;
      if (!registrationIds && !eligible.length) throw new Error('Tidak ada peserta confirmed yang belum mengambil racepack.');
      if (registrationIds && registrationIds.some((id) => !eligible.some((item) => item.id === id))) throw new Error('Peserta terpilih harus berstatus confirmed dan belum mengambil racepack.');
      const response = await fetch(`/api/eo/events/${eventId}/racepack-notifications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: notificationType, registration_ids: registrationIds, message: notificationMessage || undefined }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || payload.message || 'Notifikasi gagal dikirim.');
      setNotificationResult(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Notifikasi gagal dikirim.');
    } finally {
      setNotificationSending(false);
    }
  };
  const exportData = (kind: 'registrations' | 'statistics') => {
    if (!eventId) return;
    const query = new URLSearchParams({ status: status || 'all' });
    if (additionId) query.set('addition_id', additionId);
    window.open(`/api/eo/events/${eventId}/${kind}/export?${query}`, '_blank');
  };
  const downloadTemplate = async () => {
    setTemplatesLoading(true);
    try {
      const response = await fetch('/api/eo/registrations/import/examples/list');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Template import gagal dimuat.');
      const files = Array.isArray(payload.files) ? payload.files : Array.isArray(payload.data?.files) ? payload.data.files : [];
      setTemplates(files.map((file: unknown) => typeof file === 'string' ? file : String((file as { name?: string; filename?: string }).name || (file as { filename?: string }).filename || '')).filter(Boolean));
      templateModal.open();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Template import gagal dimuat.');
    } finally {
      setTemplatesLoading(false);
    }
  };

  return <Stack>
    <Title order={1}>Peserta</Title>
    {error && <Alert color="red" icon={<IconAlertCircle size={18} />}>{error}</Alert>}
    <Group align="end">
      <Select label="Event" data={events.map((event) => ({ value: event.id, label: event.name }))} value={eventId} onChange={setEventId} style={{ flex: 1 }} />
      <Select label="Edisi" placeholder="Semua edisi" data={additions.map((addition) => ({ value: addition.id, label: addition.name }))} value={additionId} onChange={setAdditionId} clearable style={{ flex: 1 }} />
      <TextInput label="Cari peserta" value={search} onChange={(event) => setSearch(event.currentTarget.value)} style={{ flex: 1 }} />
      <Select label="Status" data={['all', 'confirmed', 'pending_payment', 'cancelled', 'refunded']} value={status} onChange={setStatus} />
      <Button onClick={load}>Cari</Button>
    </Group>
    <Group>
      <Button size="xs" variant="filled" leftSection={<IconCamera size={15} />} onClick={() => { scannerModal.open(); setTimeout(() => { void startCamera(); }, 0); }}>Scan QR</Button>
      <Button size="xs" variant="light" leftSection={<IconMail size={15} />} onClick={() => { setNotificationType('invitation'); setNotificationMessage(''); setNotificationResult(null); notificationModal.open(); }}>Undangan racepack</Button>
      <Button size="xs" variant="light" leftSection={<IconPackage size={15} />} onClick={() => { setNotificationType('reminder'); setNotificationMessage(''); setNotificationResult(null); notificationModal.open(); }}>Pengingat racepack</Button>
      <Button size="xs" variant="subtle" leftSection={<IconDownload size={15} />} onClick={() => exportData('registrations')}>Export peserta</Button>
      <Button size="xs" variant="subtle" onClick={() => exportData('statistics')}>Export statistik</Button>
      <Button size="xs" variant="subtle" onClick={downloadTemplate} loading={templatesLoading}>Template import</Button>
    </Group>
    {loading ? <Loader /> : items.map((registration) => <Card key={registration.id} withBorder>
      <Group justify="space-between">
        <Group>
          <Checkbox checked={selected.includes(registration.id)} onChange={(event) => setSelected((current) => event.currentTarget.checked ? [...current, registration.id] : current.filter((id) => id !== registration.id))} />
          <div><Text fw={600}>{fullName(registration)}</Text><Text size="sm" c="dimmed">{registration.email} · {ticketName(registration)}</Text></div>
        </Group>
        <Group>
          <Badge>{registration.status || 'unknown'}</Badge>
          <Button size="xs" variant="subtle" onClick={() => { setDetail(registration); detailModal.open(); }}>Detail</Button>
          <Button size="xs" variant="subtle" onClick={() => action(registration.id, 'invoice')}>Kirim invoice</Button>
          <Button size="xs" variant="light" disabled={racepackTaken(registration)} onClick={() => action(registration.id, 'racepack')}>{racepackTaken(registration) ? 'Diambil' : 'Racepack diambil'}</Button>
        </Group>
      </Group>
    </Card>)}
    {!loading && !items.length && <Text c="dimmed" ta="center" py="xl">Tidak ada peserta ditemukan.</Text>}
    <Modal opened={detailOpened} onClose={detailModal.close} title="Detail peserta" size="lg"><Stack>
      <Text fw={700}>{detail ? fullName(detail) : 'Peserta'}</Text>
      <Text>Email: {detail?.email || '-'}</Text><Text>Telepon: {detail?.phone || '-'}</Text><Text>Nomor identitas: {detail?.idNumber || '-'}</Text>
      <Text>Tipe tiket: {detail ? ticketName(detail) : '-'}</Text><Text>Jumlah pesanan: {detail?.quantity || 0}</Text><Text>Status: {detail?.status || '-'}</Text>
      <Text>Racepack: {detail && racepackTaken(detail) ? 'Sudah diambil' : 'Belum diambil'}</Text>
      {detail?.totalAmount !== undefined && <Text>Total pembayaran: Rp{detail.totalAmount.toLocaleString('id-ID')}</Text>}
      <Title order={4} mt="sm">Tiket peserta</Title>
      {detail?.tickets?.length ? detail.tickets.map((ticket, index) => <Card withBorder key={ticket.id} padding="sm"><Text fw={600}>{index + 1}. {`${ticket.participantFirstName || ''} ${ticket.participantLastName || ''}`.trim() || 'Peserta'}</Text><Text size="sm" c="dimmed">Ukuran kaos: {ticket.tShirtSize || '-'}</Text><Text size="sm" c="dimmed">Add-on: {ticket.addons?.length ? ticket.addons.map((addon) => addon.name || 'Add-on').join(', ') : 'Tidak ada'}</Text></Card>) : <Text c="dimmed">Detail tiket tidak tersedia dari respons registrasi.</Text>}
      <Text size="xs" c="dimmed">ID registrasi: {detail?.id}</Text>
    </Stack></Modal>
    <Modal opened={scannerOpened} onClose={() => { stopCamera(); scannerModal.close(); }} title="Scan QR peserta" size="lg"><Stack>
      <video ref={videoRef} muted playsInline style={{ width: '100%', borderRadius: 8, background: '#000' }} />
      {cameraError && <Alert color="yellow">{cameraError}</Alert>}
      <TextInput label="ID registrasi manual" placeholder="Tempel hasil QR atau ID registrasi" value={scanValue} onChange={(event) => setScanValue(event.currentTarget.value)} />
      <Button onClick={() => showRegistration(scanValue)}>Tampilkan peserta</Button>
    </Stack></Modal>
    <Modal opened={notificationOpened} onClose={notificationModal.close} title={notificationType === 'invitation' ? 'Kirim undangan racepack' : 'Kirim reminder racepack'} centered><Stack>
      {notificationResult ? <Alert color={notificationResult.failed ? 'yellow' : 'green'} title={notificationResult.failed ? 'Pengiriman selesai sebagian' : 'Notifikasi berhasil dikirim'}>
        Total: {notificationResult.total || 0} · Terkirim: {notificationResult.sent || 0} · Gagal: {notificationResult.failed || 0}
        {notificationResult.failed_registration_ids?.length ? <Text size="sm" mt="xs">ID gagal: {notificationResult.failed_registration_ids.join(', ')}</Text> : null}
      </Alert> : <>
        <Text size="sm" c="dimmed">{selected.length ? `${selected.length} peserta terpilih akan menerima email.` : 'Email akan dikirim ke seluruh peserta confirmed yang belum mengambil racepack.'}</Text>
        <Textarea label="Pesan tambahan" description="Opsional, maksimal 1.000 karakter." maxLength={1000} value={notificationMessage} onChange={(event) => setNotificationMessage(event.currentTarget.value)} minRows={4} />
        <Text size="xs" c="dimmed">{notificationMessage.length}/1000</Text>
        <Button onClick={notify} loading={notificationSending}>Kirim {notificationType === 'invitation' ? 'undangan' : 'reminder'}</Button>
      </>}
    </Stack></Modal>
    <Modal opened={templatesOpened} onClose={templateModal.close} title="Template import peserta"><Stack>{templates.length ? templates.map((file) => <Button key={file} component="a" href={`/api/eo/registrations/import/examples/download/${encodeURIComponent(file)}`} target="_blank" variant="light" leftSection={<IconDownload size={16} />}>{file}</Button>) : <Text c="dimmed">Tidak ada template yang tersedia.</Text>}</Stack></Modal>
  </Stack>;
}
