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

interface PaymentChannel {
  code: string;
  name: string;
  icon_url?: string | null;
  type: string;
  fee?: { flat: number; percent: number };
  active: boolean;
}

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  normal_price?: number;
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

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Payment channel state
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [paymentChannelsLoading, setPaymentChannelsLoading] = useState(false);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<string | null>(null);
  const [transferFee, setTransferFee] = useState<number>(0);
  const [feeLoading, setFeeLoading] = useState(false);

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

        // // Fetch landing page data to get org phone
        // try {
        //   const landingPageUrl = '/api/landing-page';
        //   const params_obj = new URLSearchParams(window.location.search);
        //   const key = params_obj.get('key');
        //   const landingPageResponse = await fetch(`${landingPageUrl}?key=${key}`);
        //   if (landingPageResponse.ok) {
        //     const landingPageData = await landingPageResponse.json();
        //     const phone = landingPageData?.data?.organization?.phone;
        //     if (phone) setOrgPhone(phone);
        //   }
        // } catch (err) {
        //   console.error('Error fetching landing page data:', err);
        // }
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
    const ticket = tickets.find((t) => t.id === ticketId);
    const initialQty = ticket?.min_per_order ?? 1;
    setSelectedTicketId(ticketId);
    setQuantity(initialQty);
    setTicketsData(Array(initialQty).fill(null).map(() => ({ bib_name: '', shirt_size: '' })));
    setBuyerData({ first_name: '', last_name: '', email: '', phone: '', id_number: '' });
    setPromoCode('');
    setTncAccepted(false);
    setSelectedPaymentChannel(null);
    setTransferFee(0);
    setActiveStep(0);
    setCheckoutOpen(true);
    // Fetch payment channels
    setPaymentChannelsLoading(true);
    fetch('/api/registrations/payment-channels')
      .then((r) => r.json())
      .then((json) => {
        const channels = Array.isArray(json) ? json : (json?.data ?? []);
        setPaymentChannels(channels.filter((c: PaymentChannel) => c.active !== false));
      })
      .catch(() => {})
      .finally(() => setPaymentChannelsLoading(false));
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

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleBuyerDataChange = (field: keyof typeof buyerData, value: string) => {
    setBuyerData({ ...buyerData, [field]: value });
  };

  const handlePaymentChannelSelect = (code: string) => {
    setSelectedPaymentChannel(code);
    const baseAmount = selectedTicketId && event
      ? (event.additions.flatMap((a) => a.tickets).find((t) => t.id === selectedTicketId)?.price_cents || 0) * quantity
      : 0;
    if (baseAmount > 0) {
      setFeeLoading(true);
      setTransferFee(0);
      fetch(`/api/registrations/fee-calculator?code=${encodeURIComponent(code)}&amount=${baseAmount}`)
        .then((r) => r.json())
        .then((json) => {
          const fee = json?.data?.[0]?.total_fee?.customer ?? 0;
          setTransferFee(typeof fee === 'number' ? fee : 0);
        })
        .catch(() => {})
        .finally(() => setFeeLoading(false));
    }
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
      payment_method: selectedPaymentChannel,
      promo_code: promoCode || undefined,
      tnc_accepted: tncAccepted,
    };

    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/registrations/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setCheckoutError(json?.message ?? json?.error ?? 'Terjadi kesalahan. Silakan coba lagi.');
        return;
      }
      console.log('Checkout response:', json);
      const paymentUrl = json?.payment_url ?? json?.registration?.payment_url;
      console.log('Payment URL:', paymentUrl);
      if (paymentUrl) {
        console.log('Opening payment URL in new tab');
        window.open(paymentUrl, '_blank');
        // Delay modal close to ensure window.open executes
        setTimeout(() => setCheckoutOpen(false), 100);
      } else {
        console.warn('No payment URL found in response');
        setCheckoutOpen(false);
      }
    } catch {
      setCheckoutError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setCheckoutLoading(false);
    }
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
                    <Box
                      key={ticket.id}
                      style={{
                        display: 'flex',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid #dee2e6',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        opacity: (isSoldOut || isExpired || !ticket.is_active) ? 0.75 : 1,
                      }}
                    >
                      {/* Left accent bar */}
                      <Box style={{
                        width: 8,
                        backgroundColor: isSoldOut ? '#adb5bd' : isExpired ? '#fd7e14' : '#228be6',
                        flexShrink: 0,
                      }} />

                      {/* Main content */}
                      <Box style={{ flex: 1, padding: '20px 24px', minWidth: 0 }}>
                        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                          {/* Left: ticket info */}
                          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="xs" align="center" wrap="wrap">
                              <IconTicket size={20} color={isSoldOut ? '#adb5bd' : '#228be6'} />
                              <Text fw={800} size="xl" style={{ lineHeight: 1.2 }}>{ticket.name}</Text>
                              {!ticket.is_active && <Badge color="gray" size="sm" radius="xl">Nonaktif</Badge>}
                              {isSoldOut && <Badge color="red" size="sm" radius="xl">Habis Terjual</Badge>}
                              {isExpired && !isSoldOut && <Badge color="orange" size="sm" radius="xl">Penjualan Berakhir</Badge>}
                            </Group>

                            {ticket.description && (
                              <Text size="sm" c="dimmed" lineClamp={2} style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                {ticket.description}
                              </Text>
                            )}

                            <Group gap="xl" mt={4} wrap="wrap">
                              <Box>
                                <Text size="xs" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Berakhir</Text>
                                <Group gap={4} mt={2}>
                                  <IconClock size={13} color="#868e96" />
                                  <Text size="sm" fw={600}>{formatDate(ticket.sale_end)}</Text>
                                </Group>
                              </Box>
                              <Box>
                                <Text size="xs" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sisa</Text>
                                <Text size="sm" fw={700} mt={2} c={availableQty <= 10 ? 'red' : 'dark'}>
                                  {availableQty} tiket
                                </Text>
                              </Box>
                              <Box>
                                <Text size="xs" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Per Pesanan</Text>
                                <Text size="sm" fw={600} mt={2}>
                                  {ticket.min_per_order === ticket.max_per_order
                                    ? `${ticket.min_per_order} tiket`
                                    : `${ticket.min_per_order}–${ticket.max_per_order} tiket`}
                                </Text>
                              </Box>
                            </Group>
                          </Stack>

                          {/* Perforated divider */}
                          <Box style={{
                            width: 1,
                            alignSelf: 'stretch',
                            borderLeft: '2px dashed #dee2e6',
                            margin: '0 8px',
                            flexShrink: 0,
                          }} />

                          {/* Right: price + action */}
                          <Stack align="center" justify="center" gap="sm" style={{ minWidth: 120 }}>
                            <Box style={{ textAlign: 'center' }}>
                              <Text size="xs" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Harga</Text>
                              {ticket.price_cents === 0 ? (
                                <Text fw={900} size="xl" c="green" style={{ lineHeight: 1.2 }}>
                                  Gratis
                                </Text>
                              ) : ticket.normal_price && ticket.normal_price > ticket.price_cents ? (
                                <Box>
                                  <Group justify="center" gap={4}>
                                    <Text fw={900} size="xl" c="#1971c2" style={{ lineHeight: 1.2 }}>
                                      {formatPrice(ticket.price_cents)}
                                    </Text>
                                    <Text fw={600} size="sm" c="dimmed" style={{ lineHeight: 1.2, textDecoration: 'line-through' }}>
                                      {formatPrice(ticket.normal_price)}
                                    </Text>
                                  </Group>
                                  <Badge size="sm" color="red" mt={4}>Diskon</Badge>
                                </Box>
                              ) : (
                                <Text fw={900} size="xl" c="#1971c2" style={{ lineHeight: 1.2 }}>
                                  {formatPrice(ticket.price_cents)}
                                </Text>
                              )}
                            </Box>
                            <Button
                              size="sm"
                              radius="xl"
                              fullWidth
                              disabled={isSoldOut || isExpired || !ticket.is_active}
                              onClick={() => handleSelectTicket(ticket.id)}
                              variant={isSoldOut || isExpired ? 'light' : 'filled'}
                              color={isSoldOut ? 'gray' : isExpired ? 'orange' : 'blue'}
                            >
                              {isSoldOut ? 'Habis' : isExpired ? 'Berakhir' : 'Daftar'}
                            </Button>
                          </Stack>
                        </Group>
                      </Box>
                    </Box>
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
            <Box style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f59f00', padding: '10px 14px', marginTop: 10 }}>
              <Text fw={600} c="#6d4c00" size="sm">⚠️ Biaya Transfer Pembayaran: Setiap biaya transfer atau biaya layanan yang dikenakan oleh metode pembayaran yang dipilih (virtual account, e-wallet, minimarket, dll.) sepenuhnya menjadi tanggung jawab pembeli tiket.</Text>
            </Box>
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
              {(() => {
                const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
                const minQty = selectedTicket?.min_per_order ?? 1;
                const maxQty = selectedTicket?.max_per_order ?? 10;
                return (
                  <>
                    <NumberInput
                      label="Jumlah Tiket"
                      description={`Minimum ${minQty} tiket, maksimum ${maxQty} tiket per pesanan`}
                      min={minQty}
                      max={maxQty}
                      value={quantity}
                      onChange={handleQuantityChange}
                    />
                    <Text size="sm" c="dimmed">
                      Harga per tiket:{' '}
                      {selectedTicketId
                        ? formatPrice(selectedTicket?.price_cents || 0)
                        : '-'}
                    </Text>
                    <Button
                      onClick={() => setActiveStep(1)}
                      disabled={quantity < minQty || quantity > maxQty}
                    >
                      Lanjutkan
                    </Button>
                  </>
                );
              })()}
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
                error={buyerData.email && !isValidEmail(buyerData.email) ? 'Masukkan alamat email yang valid' : undefined}
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
                    !isValidEmail(buyerData.email) ||
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
                  {/* Payment Channels */}
                  <Box mt={4}>
                    <Text size="sm" fw={500} mb={8}>
                      Metode Pembayaran <span style={{ color: '#fa5252' }}>*</span>
                    </Text>
                    {paymentChannelsLoading ? (
                      <SimpleGrid cols={4} spacing="xs">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <Skeleton key={i} height={72} radius="md" />
                        ))}
                      </SimpleGrid>
                    ) : paymentChannels.length === 0 ? (
                      <Text c="dimmed" size="sm">Tidak ada metode pembayaran tersedia.</Text>
                    ) : (
                      <SimpleGrid cols={{ base: 3, xs: 4 }} spacing="xs">
                        {paymentChannels.map((ch) => {
                          const selected = selectedPaymentChannel === ch.code;
                          return (
                            <Box
                              key={ch.code}
                              onClick={() => handlePaymentChannelSelect(ch.code)}
                              style={{
                                cursor: 'pointer',
                                border: `${selected ? 2 : 1}px solid ${selected ? '#228be6' : '#dee2e6'}`,
                                borderRadius: 8,
                                backgroundColor: selected ? '#e7f5ff' : '#fff',
                                padding: '8px 6px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                transition: 'all 0.15s',
                              }}
                            >
                              {ch.icon_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={ch.icon_url}
                                  alt={ch.name}
                                  style={{ height: 30, width: 'auto', objectFit: 'contain', maxWidth: 56 }}
                                />
                              ) : (
                                <Box style={{ height: 30, display: 'flex', alignItems: 'center' }}>
                                  <Text size="xs" fw={700} c="dimmed">{ch.code.slice(0, 4)}</Text>
                                </Box>
                              )}
                              <Text
                                size="xs"
                                fw={selected ? 700 : 500}
                                c={selected ? '#1971c2' : 'dark'}
                                ta="center"
                                style={{ lineHeight: 1.2, fontSize: 10 }}
                              >
                                {ch.name}
                              </Text>
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    )}
                  </Box>
                  {selectedPaymentChannel && (
                    <Group justify="space-between">
                      <Text c="dimmed" size="sm">Biaya Transfer:</Text>
                      <Text fw={600} size="sm" c={feeLoading ? 'dimmed' : undefined}>
                        {feeLoading ? 'Menghitung...' : formatPrice(transferFee)}
                      </Text>
                    </Group>
                  )}
                  <Divider />
                  <Box style={{ backgroundColor: '#e7f5ff', borderRadius: 8, padding: '10px 14px' }}>
                    <Group justify="space-between">
                      <Text fw={700} c="#1971c2">Total yang Dibayar:</Text>
                      <Text fw={800} size="xl" c="#1971c2">
                        {selectedTicketId
                          ? formatPrice(
                              (tickets.find((t) => t.id === selectedTicketId)?.price_cents || 0) *
                                quantity + transferFee
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

              {checkoutError && (
                <Text c="red" size="sm">{checkoutError}</Text>
              )}
              <Group justify="space-between">
                <Button variant="subtle" onClick={() => setActiveStep(2)} disabled={checkoutLoading}>
                  Kembali
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={!tncAccepted || !selectedPaymentChannel || checkoutLoading}
                  loading={checkoutLoading}
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
