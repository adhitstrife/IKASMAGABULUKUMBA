'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Divider,
  Stack,
  Paper,
  Skeleton,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Checkbox,
  SimpleGrid,
  Stepper,
  Anchor,
  ScrollArea,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconTicket,
  IconClock,
} from '@tabler/icons-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/events';
import { formatDate, formatPrice } from '@/lib/utils';

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  quantity: number;
  quantity_sold: number;
  quantity_reserved: number | null;
  sale_start: string;
  sale_end: string;
  min_per_order: number;
  max_per_order: number;
  is_active: boolean;
}

interface EventAddition {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  tickets: Ticket[];
}

interface ApiEvent {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  additions: EventAddition[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgPhone, setOrgPhone] = useState<string | null>(null);

  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerData, setBuyerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
  });
  const [ticketsData, setTicketsData] = useState<Array<{ bib_name: string; shirt_size: string }>>([]);
  const [promoCode, setPromoCode] = useState('');
  const [tncAccepted, setTncAccepted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event data
        const eventResponse = await fetch(`/api/events/${params.id}`);
        if (!eventResponse.ok) throw new Error('Event tidak ditemukan');
        const eventData = await eventResponse.json();
        console.log('Event detail page response:', eventData);
        const extractedEventData = eventData?.data ?? eventData;
        setEvent(extractedEventData);

        // Fetch landing page data to get org phone
        try {
          const landingPageUrl = '/api/landing-page';
          const params_obj = new URLSearchParams(window.location.search);
          const key = params_obj.get('key');
          const landingPageResponse = await fetch(`${landingPageUrl}?key=${key}`);
          if (landingPageResponse.ok) {
            const landingPageData = await landingPageResponse.json();
            const phone = landingPageData?.data?.organization?.phone;
            if (phone) setOrgPhone(phone);
          }
        } catch (err) {
          console.error('Error fetching landing page data:', err);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Gagal memuat detail event.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  const handleBuyTicket = (ticketId: string) => {
    // Redirect to WhatsApp instead of checkout
    if (!orgPhone) {
      alert('Nomor WhatsApp organisasi tidak tersedia');
      return;
    }

    const ticket = event?.additions?.[0]?.tickets?.find((t) => t.id === ticketId);
    if (!ticket) return;

    const message = `Halo, saya ingin membeli tiket "${ticket.name}" untuk event "${event?.name}"`;
    const encodedMessage = encodeURIComponent(message);
    // Format phone: remove non-digits and add country code if needed
    const cleanPhone = orgPhone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.substring(1);
    
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setQuantity(1);
    setTicketsData([{ bib_name: '', shirt_size: '' }]);
    setBuyerData({ first_name: '', last_name: '', email: '', phone: '', id_number: '' });
    setPromoCode('');
    setTncAccepted(false);
    setActiveStep(0);
    setCheckoutOpen(true);
  };

  const handleQuantityChange = (value: number | string) => {
    const qty = typeof value === 'string' ? parseInt(value) : value;
    if (qty > 0) {
      setQuantity(qty);
      // Initialize ticket data for each ticket
      setTicketsData(Array(qty).fill(null).map(() => ({ bib_name: '', shirt_size: '' })));
    }
  };

  const handleTicketDataChange = (index: number, field: 'bib_name' | 'shirt_size', value: string) => {
    const newTicketsData = [...ticketsData];
    newTicketsData[index][field] = value;
    setTicketsData(newTicketsData);
  };

  const handleBuyerDataChange = (field: keyof typeof buyerData, value: string) => {
    setBuyerData({ ...buyerData, [field]: value });
  };

  const handleCheckout = async () => {
    if (!selectedTicketId || !event) return;

    const allAdditions = event.additions ?? [];
    const ticket = allAdditions
      .flatMap((a) => a.tickets)
      .find((t) => t.id === selectedTicketId);
    
    const addition = allAdditions.find(
      (a) => a.tickets.some((t) => t.id === selectedTicketId)
    );

    if (!ticket || !addition) return;

    const payload = {
      event_id: event.id,
      addition_id: addition.id,
      ticket_type_id: ticket.id,
      first_name: buyerData.first_name,
      last_name: buyerData.last_name,
      email: buyerData.email,
      phone: buyerData.phone,
      id_number: buyerData.id_number,
      quantity,
      tickets: ticketsData,
      promo_code: promoCode || undefined,
      tnc_accepted: tncAccepted,
    };

    console.log('Checkout payload:', payload);
    // TODO: Send to backend
    alert('Pesanan berhasil! (Mock)');
    setCheckoutOpen(false);
  };

  if (loading) {
    return (
      <Box py={80}>
        <Container size="md">
          <Skeleton height={300} radius="xl" mb="lg" />
          <Skeleton height={32} width="60%" mb="sm" />
          <Skeleton height={16} width="40%" mb="xl" />
          <Skeleton height={100} mb="md" />
          <Skeleton height={100} />
        </Container>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box py={80}>
        <Container size="md" style={{ textAlign: 'center' }}>
          <Title order={3} c="dimmed" mb="md">
            {error || 'Event tidak ditemukan'}
          </Title>
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => router.push('/')}>
            Kembali ke Beranda
          </Button>
        </Container>
      </Box>
    );
  }

  const allAdditions = event.additions ?? [];
  const tickets = allAdditions.length > 0 
    ? allAdditions.flatMap((addition) => addition.tickets ?? [])
    : [];
  const totalSeats = tickets.reduce((sum, t) => sum + t.quantity, 0);
  const totalSold = tickets.reduce((sum, t) => sum + t.quantity_sold, 0);
  const seatPercent = totalSeats > 0 ? Math.round((totalSold / totalSeats) * 100) : 0;
  const isAlmostFull = seatPercent >= 80;

  return (
    <Box py={60}>
      <Container size="md">
        {/* Back button */}
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          mb="lg"
          onClick={() => router.push('/')}
        >
          Kembali
        </Button>

        {/* Hero image */}
        <Box
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: '1.5rem',
            position: 'relative',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1519703936-c4a3b3eb88e4?q=80&w=1170&auto=format&fit=crop"
            alt={event.name}
            style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
          />
          <Box style={{ position: 'absolute', top: 16, left: 16 }}>
            <Badge color="green" size="md" radius="xl" fw={600}>
              Olahraga
            </Badge>
          </Box>
        </Box>

        {/* Event info */}
        <Stack gap="md">
          <Title order={1} style={{ fontSize: '1.9rem', lineHeight: 1.25 }}>
            {event.name}
          </Title>

          <Group gap="lg" wrap="wrap">
            <Group gap={6} c="dimmed">
              <IconCalendar size={16} />
              <Text size="sm">{formatDate(event.created_at)}</Text>
            </Group>
            <Group gap={6} c="dimmed">
              <IconMapPin size={16} />
              <Text size="sm">Bulukumba</Text>
            </Group>
            <Group gap={6} c="dimmed">
              <IconUsers size={16} />
              <Text size="sm">
                {totalSold}/{totalSeats} peserta
              </Text>
            </Group>
          </Group>

          {/* Seat progress */}
          {totalSeats > 0 && (
            <Box>
              <Group justify="space-between" mb={6}>
                <Text size="xs" c="dimmed">Kursi terisi</Text>
                <Text size="xs" fw={600} c={isAlmostFull ? 'red' : 'blue'}>
                  {seatPercent}%
                </Text>
              </Group>
              <Box
                style={{
                  height: 6,
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
          )}

          <Divider />

          {/* Description */}
          <Box>
            <Title order={4} mb="sm">Tentang Event</Title>
            <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {event.description}
            </Text>
          </Box>

          <Divider />

          {/* Tickets */}
          {tickets.length > 0 && (
            <Box>
              <Title order={4} mb="sm">Tiket</Title>
              <Stack gap="sm">
                {tickets.map((ticket) => {
                  const availableQty = ticket.quantity - ticket.quantity_sold;
                  const isSoldOut = availableQty <= 0;
                  const isExpired = new Date(ticket.sale_end) < new Date();

                  return (
                    <Paper key={ticket.id} withBorder radius="xl" p="md">
                      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                        <Box style={{ flex: 1 }}>
                          <Group gap="xs" mb={4}>
                            <IconTicket size={16} color="#228be6" />
                            <Text fw={700} size="sm">{ticket.name}</Text>
                            {!ticket.is_active && (
                              <Badge color="gray" size="xs">Nonaktif</Badge>
                            )}
                            {isSoldOut && (
                              <Badge color="red" size="xs">Habis</Badge>
                            )}
                          </Group>
                          {ticket.description && (
                            <Text size="xs" c="dimmed" lineClamp={3} mb={6} style={{ whiteSpace: 'pre-line' }}>
                              {ticket.description}
                            </Text>
                          )}
                          <Group gap="lg" wrap="wrap">
                            <Group gap={4} c="dimmed">
                              <IconClock size={12} />
                              <Text size="xs">
                                Sampai {formatDate(ticket.sale_end)}
                              </Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                              Sisa {availableQty} tiket
                            </Text>
                          </Group>
                        </Box>
                        <Box style={{ textAlign: 'right' }}>
                          <Text fw={800} size="lg" c={ticket.price_cents === 0 ? 'green' : 'dark'} mb={8}>
                            {ticket.price_cents === 0 ? 'Gratis' : formatPrice(ticket.price_cents)}
                          </Text>
                          <Button
                            size="sm"
                            radius="xl"
                            disabled={isSoldOut || isExpired || !ticket.is_active}
                            onClick={() => handleSelectTicket(ticket.id)}
                          >
                            {isSoldOut ? 'Habis' : 'Buy'}
                          </Button>
                        </Box>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      </Container>

      {/* Terms Modal */}
      <Modal
        opened={termsOpen}
        onClose={() => setTermsOpen(false)}
        title={<Text fw={700} size="lg">Syarat &amp; Ketentuan</Text>}
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
        zIndex={400}
      >
        <Stack gap="md" style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>1. Ketentuan Umum</Text>
            <Text>Dengan membeli tiket melalui platform ini, Anda setuju untuk mematuhi semua syarat dan ketentuan yang berlaku. Tiket yang dibeli adalah non-transferable kecuali dengan persetujuan dari penyelenggara event.</Text>
          </section>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>2. Pembayaran</Text>
            <Text>Pembayaran tiket harus dilakukan melalui metode pembayaran yang tersedia di platform. Setiap transaksi pembayaran akan diproses sesuai dengan informasi yang Anda berikan. Platform mengambil biaya 2.5% dari penerimaan penyelenggara acara.</Text>
          </section>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>3. Kebijakan Refund - PENTING</Text>
            <Box style={{ backgroundColor: '#fff5f5', borderLeft: '4px solid #ef4444', padding: '12px 16px', marginBottom: 12 }}>
              <Text fw={700} c="#b91c1c" mb={6}>⚠️ Perhatian: Kebijakan Refund</Text>
              <Text c="#b91c1c">Dalam hal refund, harga tiket akan dikembalikan penuh kepada pembeli. Biaya platform sebesar 2.5% tidak akan dikembalikan kepada penyelenggara acara. Refund hanya dapat diajukan sesuai dengan periode yang telah ditentukan oleh penyelenggara event.</Text>
            </Box>
          </section>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>4. Pembatalan dan Perubahan Event</Text>
            <Text>Penyelenggara event berhak untuk membatalkan, menunda, atau mengubah lokasi dan tanggal event. Dalam hal pembatalan event oleh penyelenggara, Anda berhak mendapatkan refund penuh dari harga tiket.</Text>
          </section>
          <Box style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #ca8a04', padding: '12px 16px' }}>
            <Text fw={700} size="md" c="#111827" mb={6}>5. Batasan Tanggung Jawab Platform</Text>
            <Text c="#111827">Platform TIDAK bertanggung jawab atas perubahan, penundaan, atau pembatalan event. Semua keputusan terkait dengan perubahan atau pembatalan event sepenuhnya menjadi tanggung jawab event organizer/penyelenggara.</Text>
          </Box>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>6. Data Pribadi</Text>
            <Text>Informasi pribadi yang Anda berikan akan digunakan untuk keperluan administrasi event dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda.</Text>
          </section>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>7. Tanggung Jawab Peserta</Text>
            <Text>Peserta event setuju untuk mematuhi semua peraturan yang berlaku di lokasi event. Penyelenggara event tidak bertanggung jawab atas kehilangan, kerusakan, atau pencurian barang pribadi selama event.</Text>
          </section>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>8. Hak Penyelenggara</Text>
            <Text>Penyelenggara event berhak untuk menolak masuk atau mengeluarkan peserta yang melanggar kebijakan. Tidak ada refund dalam kasus seperti ini.</Text>
          </section>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>9. Perubahan Syarat dan Ketentuan</Text>
            <Text>Kami berhak untuk mengubah syarat dan ketentuan ini kapan saja. Penggunaan berkelanjutan dari platform ini berarti Anda menerima perubahan tersebut.</Text>
          </section>
          <Box style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px' }}>
            <Text size="xs" c="#4b5563"><strong>Terakhir diperbarui:</strong> 12 April 2026</Text>
          </Box>
        </Stack>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        opened={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Pembelian Tiket"
        size="lg"
        scrollAreaComponent={Paper}
      >
        <Stepper active={activeStep} onStepClick={setActiveStep}>
          {/* Step 1: Quantity */}
          <Stepper.Step label="Jumlah Tiket" description="Pilih jumlah">
            <Stack gap="md">
              <NumberInput
                label="Jumlah Tiket"
                min={1}
                max={10}
                value={quantity}
                onChange={handleQuantityChange}
              />
              <Text size="sm" c="dimmed">
                Harga per tiket:{' '}
                {selectedTicketId
                  ? formatPrice(
                      tickets.find((t) => t.id === selectedTicketId)?.price_cents || 0
                    )
                  : '-'}
              </Text>
              <Button
                onClick={() => setActiveStep(1)}
                disabled={quantity < 1}
              >
                Lanjutkan
              </Button>
            </Stack>
          </Stepper.Step>

          {/* Step 2: Buyer Data */}
          <Stepper.Step label="Data Pembeli" description="Isi informasi">
            <Stack gap="md">
              <SimpleGrid cols={2} spacing="md">
                <TextInput
                  label="Nama Depan"
                  placeholder="John"
                  value={buyerData.first_name}
                  onChange={(e) => handleBuyerDataChange('first_name', e.currentTarget.value)}
                  required
                />
                <TextInput
                  label="Nama Belakang"
                  placeholder="Doe"
                  value={buyerData.last_name}
                  onChange={(e) => handleBuyerDataChange('last_name', e.currentTarget.value)}
                  required
                />
              </SimpleGrid>
              <TextInput
                label="Email"
                placeholder="john@example.com"
                type="email"
                value={buyerData.email}
                onChange={(e) => handleBuyerDataChange('email', e.currentTarget.value)}
                required
              />
              <TextInput
                label="Nomor Telepon"
                placeholder="+62812345678"
                value={buyerData.phone}
                onChange={(e) => handleBuyerDataChange('phone', e.currentTarget.value)}
                required
              />
              <TextInput
                label="Nomor Identitas"
                placeholder="1234567890123456"
                value={buyerData.id_number}
                onChange={(e) => handleBuyerDataChange('id_number', e.currentTarget.value)}
                required
              />
              <Group justify="space-between">
                <Button variant="subtle" onClick={() => setActiveStep(0)}>
                  Kembali
                </Button>
                <Button
                  onClick={() => setActiveStep(2)}
                  disabled={
                    !buyerData.first_name ||
                    !buyerData.last_name ||
                    !buyerData.email ||
                    !buyerData.phone ||
                    !buyerData.id_number
                  }
                >
                  Lanjutkan
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          {/* Step 3: Ticket Details */}
          <Stepper.Step label="Detail Tiket" description="Isi setiap tiket">
            <Stack gap="md">
              {ticketsData.map((ticketItem, index) => (
                <Paper key={index} withBorder p="md" radius="md">
                  <Title order={5} mb="md">
                    Tiket {index + 1}
                  </Title>
                  <Stack gap="sm">
                    <TextInput
                      label="Nama Peserta (Bib Name)"
                      placeholder="Nama untuk dada nomor"
                      value={ticketItem.bib_name}
                      onChange={(e) =>
                        handleTicketDataChange(index, 'bib_name', e.currentTarget.value)
                      }
                      required
                    />
                    <Select
                      label="Ukuran Baju"
                      placeholder="Pilih ukuran"
                      data={[
                        { value: 'XS', label: 'XS' },
                        { value: 'S', label: 'S' },
                        { value: 'M', label: 'M' },
                        { value: 'L', label: 'L' },
                        { value: 'XL', label: 'XL' },
                        { value: 'XXL', label: 'XXL' },
                      ]}
                      value={ticketItem.shirt_size}
                      onChange={(val) =>
                        handleTicketDataChange(index, 'shirt_size', val || '')
                      }
                      required
                    />
                  </Stack>
                </Paper>
              ))}
              <Group justify="space-between">
                <Button variant="subtle" onClick={() => setActiveStep(1)}>
                  Kembali
                </Button>
                <Button
                  onClick={() => setActiveStep(3)}
                  disabled={ticketsData.some((t) => !t.bib_name || !t.shirt_size)}
                >
                  Lanjutkan
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          {/* Step 4: Review & Checkout */}
          <Stepper.Step label="Review & Checkout" description="Konfirmasi pesanan">
            <Stack gap="md">
              <Paper withBorder p="md" radius="md">
                <Title order={5} mb="sm">
                  Ringkasan Pesanan
                </Title>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text c="dimmed" size="sm">Jumlah Tiket:</Text>
                    <Text fw={600} size="sm">{quantity}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text c="dimmed" size="sm">Harga per Tiket:</Text>
                    <Text fw={600} size="sm">
                      {selectedTicketId
                        ? formatPrice(
                            tickets.find((t) => t.id === selectedTicketId)?.price_cents || 0
                          )
                        : '-'}
                    </Text>
                  </Group>
                  <Divider />
                  <Box style={{ backgroundColor: '#e7f5ff', borderRadius: 8, padding: '10px 14px' }}>
                    <Group justify="space-between">
                      <Text fw={700} c="#1971c2">Total yang Dibayar:</Text>
                      <Text fw={800} size="xl" c="#1971c2">
                        {selectedTicketId
                          ? formatPrice(
                              (tickets.find((t) => t.id === selectedTicketId)?.price_cents || 0) *
                                quantity
                            )
                          : '-'}
                      </Text>
                    </Group>
                  </Box>
                </Stack>
              </Paper>

              <TextInput
                label="Kode Promo (Opsional)"
                placeholder="Masukkan kode promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.currentTarget.value)}
              />

              <Checkbox
                label={
                  <Text size="sm">
                    Saya telah membaca dan menyetujui{' '}
                    <Anchor
                      size="sm"
                      onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}
                      style={{ cursor: 'pointer' }}
                    >
                      Syarat &amp; Ketentuan
                    </Anchor>
                  </Text>
                }
                checked={tncAccepted}
                onChange={(e) => setTncAccepted(e.currentTarget.checked)}
              />

              <Group justify="space-between">
                <Button variant="subtle" onClick={() => setActiveStep(2)}>
                  Kembali
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={!tncAccepted}
                >
                  Konfirmasi & Bayar
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>
        </Stepper>
      </Modal>
    </Box>
  );
}
