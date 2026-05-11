'use client';

import { Box, Container, SimpleGrid, Image, Title, Text, Skeleton, Button } from '@mantine/core';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NewsItem } from '@/types/news';

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
                <Skeleton key={i} height={200} radius="xl" />
              ))
            : news.map((item) => {
                const coverAsset = item.assets.find((a) => a.type === 'image' && a.is_cover);
                const imageUrl = coverAsset?.url || item.assets.find((a) => a.type === 'image')?.url;

                return (
                  <Box key={item.id} component={Link} href={`/berita/${item.id}`} style={{ textDecoration: 'none' }}>
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        radius="xl"
                        fit="cover"
                        height={200}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                  </Box>
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
