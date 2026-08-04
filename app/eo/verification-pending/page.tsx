import Link from 'next/link';
import { Box, Button, Container, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconClockHour4 } from '@tabler/icons-react';

export default function VerificationPendingPage() {
  return <Box mih="100vh" py={96}><Container size={520}><Paper withBorder p="xl" radius="lg"><Stack align="center" ta="center"><ThemeIcon size={58} radius="xl" color="yellow" variant="light"><IconClockHour4 size={30} /></ThemeIcon><Title order={1}>Verifikasi sedang diproses</Title><Text c="dimmed">Dokumen organisasi Anda telah diterima. Dashboard akan dapat digunakan setelah proses verifikasi selesai.</Text><Button component={Link} href="/" variant="light">Kembali ke situs publik</Button></Stack></Paper></Container></Box>;
}
