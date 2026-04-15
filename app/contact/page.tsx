'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Divider,
  Anchor,
  Skeleton,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBrandWhatsapp,
  IconMail,
  IconPhone,
  IconMapPin,
  IconSend,
} from '@tabler/icons-react';

interface OrgData {
  name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  logo_url: string | null;
  description: string | null;
}

export default function ContactPage() {
  const router = useRouter();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetch(
      `/api/landing-page?key=${encodeURIComponent(process.env.NEXT_PUBLIC_ORG_SECRET_KEY || '')}`
    )
      .then((r) => r.json())
      .then((json) => {
        const o = json?.data?.organization;
        if (o) setOrg(o);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = () => {
    if (!org?.email) return;
    const subject = encodeURIComponent(form.subject || 'Pesan dari Website');
    const body = encodeURIComponent(
      `Nama: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:${org.email}?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = () => {
    if (!org?.phone) return;
    const clean = org.phone.replace(/\D/g, '');
    const wa = clean.startsWith('62') ? clean : '62' + clean.substring(1);
    const msg = encodeURIComponent(
      form.name
        ? `Halo, saya ${form.name}. ${form.message || 'Saya ingin menghubungi Anda.'}`
        : 'Halo, saya ingin menghubungi Anda.'
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const isFormValid = form.name.trim() && form.email.trim() && form.message.trim();
  const location = [org?.city, org?.state, org?.country].filter(Boolean).join(', ') || 'Bulukumba, Sulawesi Selatan';

  return (
    <Box py={60} style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container size="lg">
        {/* Back button */}
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          mb="lg"
          onClick={() => router.push('/')}
        >
          Kembali ke Beranda
        </Button>

        {/* Header */}
        <Box mb={48} ta="center">
          <Title order={1} style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800 }}>
            Hubungi Kami
          </Title>
          <Text c="dimmed" size="lg" mt="sm" maw={540} mx="auto">
            Ada pertanyaan atau ingin bergabung? Kami siap membantu Anda.
          </Text>
        </Box>

        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: 'stretch' }}>
          {/* Left: Contact info */}
          <Paper
            withBorder
            radius="xl"
            p="xl"
            style={{
              flex: '0 0 300px',
              background: 'linear-gradient(160deg, #1971C2 0%, #0c47a1 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <Box>
              <Title order={3} c="white" mb={4}>
                {loading ? <Skeleton height={28} width={160} /> : (org?.name ?? 'IKASMAGABULUKUMBA')}
              </Title>
              <Text c="rgba(255,255,255,0.7)" size="sm">
                {loading ? <Skeleton height={16} width={200} mt={4} /> : (org?.description ?? '')}
              </Text>
            </Box>

            <Divider color="rgba(255,255,255,0.2)" />

            <Stack gap="md">
              {/* Location */}
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <IconMapPin size={18} style={{ flexShrink: 0, marginTop: 2, opacity: 0.8 }} />
                <Text c="rgba(255,255,255,0.85)" size="sm">
                  {loading ? <Skeleton height={14} width={160} /> : location}
                </Text>
              </Group>

              {/* Phone */}
              {(loading || org?.phone) && (
                <Group gap="sm" wrap="nowrap">
                  <IconPhone size={18} style={{ flexShrink: 0, opacity: 0.8 }} />
                  {loading ? (
                    <Skeleton height={14} width={120} />
                  ) : (
                    <Anchor
                      href={`tel:${org!.phone}`}
                      c="rgba(255,255,255,0.85)"
                      size="sm"
                      style={{ textDecoration: 'none' }}
                    >
                      {org!.phone}
                    </Anchor>
                  )}
                </Group>
              )}

              {/* Email */}
              {(loading || org?.email) && (
                <Group gap="sm" wrap="nowrap">
                  <IconMail size={18} style={{ flexShrink: 0, opacity: 0.8 }} />
                  {loading ? (
                    <Skeleton height={14} width={160} />
                  ) : (
                    <Anchor
                      href={`mailto:${org!.email}`}
                      c="rgba(255,255,255,0.85)"
                      size="sm"
                      style={{ textDecoration: 'none', wordBreak: 'break-all' }}
                    >
                      {org!.email}
                    </Anchor>
                  )}
                </Group>
              )}

              {/* Website */}
              {org?.website && (
                <Group gap="sm" wrap="nowrap">
                  <IconSend size={18} style={{ flexShrink: 0, opacity: 0.8 }} />
                  <Anchor
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    c="rgba(255,255,255,0.85)"
                    size="sm"
                    style={{ textDecoration: 'none' }}
                  >
                    {org.website}
                  </Anchor>
                </Group>
              )}
            </Stack>

            {/* WhatsApp button */}
            {(loading || org?.phone) && (
              <>
                <Divider color="rgba(255,255,255,0.2)" />
                {loading ? (
                  <Skeleton height={42} radius="xl" />
                ) : (
                  <Button
                    fullWidth
                    radius="xl"
                    leftSection={<IconBrandWhatsapp size={18} />}
                    onClick={handleWhatsApp}
                    style={{
                      backgroundColor: '#25D366',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    Chat WhatsApp
                  </Button>
                )}
              </>
            )}
          </Paper>

          {/* Right: Contact form */}
          <Paper withBorder radius="xl" p="xl" style={{ flex: 1 }}>
            <Title order={3} mb="xs">Kirim Pesan</Title>
            <Text c="dimmed" size="sm" mb="lg">
              Isi formulir di bawah ini dan kami akan membalas melalui email Anda.
            </Text>

            <Stack gap="md">
              <Group grow gap="md">
                <TextInput
                  label="Nama Lengkap"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.currentTarget.value)}
                  required
                />
                <TextInput
                  label="Alamat Email"
                  placeholder="john@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.currentTarget.value)}
                  required
                />
              </Group>

              <TextInput
                label="Subjek"
                placeholder="Tentang apa pesan Anda?"
                value={form.subject}
                onChange={(e) => handleChange('subject', e.currentTarget.value)}
              />

              <Textarea
                label="Pesan"
                placeholder="Tulis pesan Anda di sini..."
                minRows={6}
                autosize
                value={form.message}
                onChange={(e) => handleChange('message', e.currentTarget.value)}
                required
              />

              <Group justify="flex-end" gap="sm" mt="xs">
                {org?.phone && (
                  <Button
                    variant="light"
                    color="green"
                    radius="xl"
                    leftSection={<IconBrandWhatsapp size={16} />}
                    onClick={handleWhatsApp}
                  >
                    Kirim via WhatsApp
                  </Button>
                )}
                <Button
                  radius="xl"
                  leftSection={<IconMail size={16} />}
                  disabled={!isFormValid || !org?.email}
                  onClick={handleSendEmail}
                >
                  Kirim via Email
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Group>
      </Container>
    </Box>
  );
}
