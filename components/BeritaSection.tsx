'use client';

import { Box, Container, SimpleGrid, Image, Title, Text, Skeleton, Button, Card, Badge, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NewsItem } from '@/types/news';
import { formatDate } from '@/lib/utils';
import { IconDownload } from '@tabler/icons-react';

export function BeritaSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/landing-page/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const result = await response.json();
        // Ambil 2 berita terbaru untuk ditampilkan di section ini
        setNews(result.data.slice(0, 2));
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <Box py={80} style={{ backgroundColor: '#f8fafc' }}>
      <Container size="lg">
        <Box mb="xl" ta="center">
          <Text
            size="sm"
            fw={700}
            tt="uppercase"
            c="blue"
            mb={6}
            style={{ letterSpacing: '0.6px' }}
          >
            Informasi Terkini
          </Text>
          <Title order={2} style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
            Berita
          </Title>
        </Box>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {loading
            ? [0, 1].map((i) => (
                <Card key={i} withBorder radius="lg" style={{ overflow: 'hidden' }}>
                  <Skeleton height={200} radius="xl" />
                </Card>
              ))
            : news.map((item) => {
                const coverAsset = item.assets.find((a) => a.type === 'image' && a.is_cover);
                const imageUrl = coverAsset?.url || item.assets.find((a) => a.type === 'image')?.url;
                const plainText = stripHtml(item.description);
                const fileAssets = item.assets.filter((a) => a.type === 'file');

                return (
                  <Card key={item.id} withBorder radius="lg" style={{ overflow: 'hidden', cursor: 'pointer' }} component={Link} href={`/berita/${item.id}`}>
                    {imageUrl ? (
                      <Card.Section>
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          radius="lg"
                          fit="cover"
                          height={200}
                        />
                      </Card.Section>
                    ) : (
                      <Card.Section>
                        <Box
                          style={{
                            height: 200,
                            backgroundColor: '#e9ecef',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text c="dimmed">Tidak ada gambar</Text>
                        </Box>
                      </Card.Section>
                    )}
                    <Card.Section p="md">
                      <Group justify="space-between" mb="xs">
                        <Group gap={6}>
                          <Badge color="blue" variant="light" size="sm">
                            {item.is_published ? 'Dipublikasikan' : 'Draft'}
                          </Badge>
                          {fileAssets.length > 0 && (
                            <Badge color="green" variant="light" size="sm" leftSection={<IconDownload size={12} />}>
                              {fileAssets.length} File
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" c="dimmed">
                          {formatDate(item.published_at)}
                        </Text>
                      </Group>
                      <Title order={4} mb="sm" lineClamp={2}>
                        {item.title}
                      </Title>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {plainText}
                      </Text>
                    </Card.Section>
                  </Card>
                );
              })}
        </SimpleGrid>
        <Box ta="center" mt="xl">
          <Button
            component={Link}
            href="/berita"
            variant="outline"
            size="md"
          >
            Lihat Semua Berita
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
