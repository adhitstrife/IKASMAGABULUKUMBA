'use client';

import { Box, Container, Grid, Card, Image, Title, Text, Badge, Button, Skeleton, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { AppFooter } from '@/components/AppFooter';
import { NewsItem } from '@/types/news';

export default function BeritaPage() {
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
        setNews(result.data || []);
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

  const NewsCardSkeleton = () => (
    <Card withBorder radius="lg" style={{ overflow: 'hidden' }}>
      <Card.Section>
        <Skeleton height={250} />
      </Card.Section>
      <Card.Section p="md">
        <Skeleton height={20} mb={8} />
        <Skeleton height={16} width="70%" mb={16} />
        <Skeleton height={16} width="100%" mb={8} />
        <Skeleton height={16} width="90%" />
      </Card.Section>
    </Card>
  );

  return (
    <>
      <Navbar />
      <main>
        <Box py={80}>
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
              <Title order={1} mb="lg">
                Semua Berita
              </Title>
            </Box>

            <Grid gutter="lg">
              {loading
                ? [0, 1, 2, 3].map((i) => (
                    <Grid.Col key={i} span={{ base: 12, sm: 6 }}>
                      <NewsCardSkeleton />
                    </Grid.Col>
                  ))
                : news.length > 0
                ? news.map((item) => {
                    const coverAsset = item.assets.find((a) => a.type === 'image' && a.is_cover);
                    const imageUrl = coverAsset?.url || item.assets.find((a) => a.type === 'image')?.url;
                    const plainText = stripHtml(item.description);

                    return (
                      <Grid.Col key={item.id} span={{ base: 12, sm: 6 }}>
                        <Card withBorder radius="lg" h="100%" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden' }} component={Link} href={`/berita/${item.id}`}>
                          {imageUrl ? (
                            <Card.Section>
                              <Image
                                src={imageUrl}
                                alt={item.title}
                                height={250}
                                fit="cover"
                              />
                            </Card.Section>
                          ) : (
                            <Card.Section>
                              <Box
                                style={{
                                  height: 250,
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
                          <Card.Section p="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Group justify="space-between" mb="xs">
                              <Badge color="blue" variant="light" size="sm">
                                {item.is_published ? 'Dipublikasikan' : 'Draft'}
                              </Badge>
                              <Text size="xs" c="dimmed">
                                {formatDate(item.published_at)}
                              </Text>
                            </Group>
                            <Title order={3} mb="sm" style={{ flex: 1 }}>
                              {item.title}
                            </Title>
                            <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                              {plainText}
                            </Text>
                            <Box mt="auto">
                              <Group justify="space-between">
                                <Text size="xs" c="dimmed">
                                  Assets: {item.assets.length}
                                </Text>
                              </Group>
                            </Box>
                          </Card.Section>
                        </Card>
                      </Grid.Col>
                    );
                  })
                : (
                    <Grid.Col span={12}>
                      <Box ta="center" py="xl">
                        <Text size="lg" c="dimmed">
                          Belum ada berita tersedia
                        </Text>
                      </Box>
                    </Grid.Col>
                  )}
            </Grid>
          </Container>
        </Box>
      </main>
      <AppFooter />
    </>
  );
}
