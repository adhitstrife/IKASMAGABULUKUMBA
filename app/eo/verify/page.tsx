'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, FileInput, Paper, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconId, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function VerifyEoPage() {
  const router = useRouter();
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejected, setRejected] = useState(false);
  const labels = ['Foto selfie', 'Foto KTP', 'Selfie bersama KTP'];

  useEffect(() => {
    fetch('/api/eo/verification/status')
      .then((response) => response.json())
      .then((payload) => setRejected(payload?.data?.status === 'rejected'))
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (files.some((file) => !file)) return setError('Semua dokumen verifikasi wajib diunggah.');
    if (files.some((file) => file && (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 10 * 1024 * 1024))) {
      return setError('Gunakan gambar JPEG/PNG dengan ukuran maksimal 10 MB.');
    }
    setError(null);
    setLoading(true);
    try {
      const base64 = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file as File);
      })));
      const response = await fetch('/api/eo/verification/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfie_url: base64[0], ktp_photo_url: base64[1], selfie_with_ktp_url: base64[2] }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Pengiriman verifikasi gagal.');
      router.replace('/eo/verification-pending');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pengiriman verifikasi gagal.');
    } finally { setLoading(false); }
  };

  return <Box mih="100vh" py={64}><Container size={560}><Paper withBorder p="xl" radius="lg"><Stack><IconId size={32} color="#228be6" /><Title order={1}>{rejected ? 'Verifikasi perlu diperbarui' : 'Verifikasi organisasi'}</Title><Text c="dimmed">{rejected ? 'Dokumen sebelumnya belum dapat diverifikasi. Unggah ulang foto yang jelas, lengkap, dan sesuai identitas organisasi.' : 'Unggah dokumen untuk mengaktifkan akses dashboard EO. File hanya digunakan untuk proses verifikasi.'}</Text>{rejected && <Alert color="yellow">Alasan penolakan tidak disediakan oleh endpoint saat ini. Pastikan foto tidak buram dan seluruh informasi identitas terlihat.</Alert>}{error && <Alert color="red" icon={<IconAlertCircle size={18} />}>{error}</Alert>}{labels.map((label, index) => <FileInput key={label} label={label} placeholder="Pilih gambar" accept="image/png,image/jpeg" leftSection={<IconUpload size={16} />} value={files[index]} onChange={(file) => setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? file : item))} />)}<Button onClick={submit} loading={loading}>Kirim untuk verifikasi</Button></Stack></Paper></Container></Box>;
}
