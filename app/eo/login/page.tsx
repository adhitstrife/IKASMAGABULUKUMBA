'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Anchor, Box, Button, Container, Group, Paper, PasswordInput, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { IconAlertCircle, IconBuildingStore, IconLock } from '@tabler/icons-react';

export default function EoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const login = await fetch('/api/eo/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await login.json();
      if (!login.ok) throw new Error(loginData.error || 'Login gagal.');

      const verification = await fetch('/api/eo/verification/status');
      const verificationData = await verification.json().catch(() => ({}));
      const status = verificationData?.data?.status;
      if (status === 'unverified' || status === 'rejected') {
        router.replace('/eo/verify');
      } else if (status === 'pending') {
        router.replace('/eo/verification-pending');
      } else {
        const next = new URLSearchParams(window.location.search).get('next');
        router.replace(next?.startsWith('/eo') ? next : '/eo');
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mih="100vh" py={{ base: 48, sm: 96 }} style={{ background: 'linear-gradient(135deg, #edf6ff 0%, #f8f9fa 45%, #eef8ee 100%)' }}>
      <Container size={420}>
        <Stack align="center" mb="xl" gap="sm">
          <ThemeIcon size={54} radius="lg" variant="filled"><IconBuildingStore size={29} /></ThemeIcon>
          <Title order={1} ta="center">Portal Event Organizer</Title>
          <Text c="dimmed" ta="center">Kelola event, peserta, dan operasional organisasi Anda.</Text>
        </Stack>
        <Paper withBorder shadow="sm" p={{ base: 'lg', sm: 'xl' }} radius="lg">
          <form onSubmit={submit}>
            <Stack>
              {error && <Alert color="red" icon={<IconAlertCircle size={18} />}>{error}</Alert>}
              <TextInput label="Email" type="email" placeholder="nama@organisasi.id" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required autoComplete="email" />
              <PasswordInput label="Password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required autoComplete="current-password" />
              <Button type="submit" size="md" leftSection={<IconLock size={17} />} loading={loading}>Masuk ke dashboard</Button>
              <Group justify="space-between"><Anchor href="/eo/forgot-password" size="sm">Lupa password?</Anchor><Anchor href="/eo/signup" size="sm">Daftar EO</Anchor></Group>
              <Anchor href="/" size="sm" ta="center" c="dimmed">Kembali ke situs publik</Anchor>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
