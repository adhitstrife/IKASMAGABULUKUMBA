'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Image,
  Title,
  Text,
  Badge,
  Group,
  Skeleton,
  Button,
  Modal,
  SimpleGrid,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { AppFooter } from '@/components/AppFooter';
import { NewsItem, NewsAsset } from '@/types/news';

export default function BeritaDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<NewsAsset | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/landing-page/news/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news detail');
        }
        const result = await response.json();
        setNews(result.data);

        // Set first image as default selected media
        const firstImage = result.data.assets.find((a: NewsAsset) => a.type === 'image');
        if (firstImage) {
          setSelectedMedia(firstImage);
        }
      } catch (error) {
        console.error('Error fetching news detail:', error);
        setNews(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <Box py={80}>
            <Container size="lg">
              <Box mb="xl">
                <Skeleton height={40} width={120} mb="lg" />
              </Box>
              <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Skeleton height={400} radius="lg" mb="xl" />
                  <Skeleton height={30} mb="lg" />
                  <Skeleton height={100} mb="lg" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Skeleton height={200} radius="lg" mb="md" />
                  <Skeleton height={200} radius="lg" />
                </Grid.Col>
              </Grid>
            </Container>
          </Box>
        </main>
        <AppFooter />
      </>
    );
  }

  if (!news) {
    return (
      <>
        <Navbar />
        <main>
          <Box py={80}>
            <Container size="lg">
              <Box ta="center">
                <Title order={2} mb="md">
                  Berita tidak ditemukan
                </Title>
                <Button component={Link} href="/berita">
                  Kembali ke daftar berita
                </Button>
              </Box>
            </Container>
          </Box>
        </main>
        <AppFooter />
      </>
    );
  }

  const coverImage = news.assets.find((a) => a.type === 'image' && a.is_cover);
  const displayImage = selectedMedia?.type === 'image' ? selectedMedia : coverImage || news.assets.find((a) => a.type === 'image');
  const images = news.assets.filter((a) => a.type === 'image');
  const videos = news.assets.filter((a) => a.type === 'video');
  const files = news.assets.filter((a) => a.type === 'file');

  return (
    <>
      <Navbar />
      <main>
        <Box py={80}>
          <Container size="lg">
            {/* Back Button */}
            <Box mb="xl">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={18} />}
                component={Link}
                href="/berita"
                p={0}
              >
                Kembali ke berita
              </Button>
            </Box>

            <Grid gutter="xl">
              {/* Main Content */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                {/* Main Image Display */}
                {displayImage ? (
                  <Image
                    src={displayImage.url}
                    alt={news.title}
                    radius="lg"
                    mb="xl"
                    fit="cover"
                    height={400}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedMedia(displayImage);
                      setModalOpened(true);
                    }}
                  />
                ) : (
                  <Box
                    style={{
                      height: 400,
                      backgroundColor: '#e9ecef',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '24px',
                    }}
                  >
                    <Text c="dimmed" size="lg">Tidak ada gambar tersedia</Text>
                  </Box>
                )}

                {/* Title and Info */}
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Badge color="blue" variant="light" size="lg">
                    {news.is_published ? 'Dipublikasikan' : 'Draft'}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {formatDate(news.published_at)}
                  </Text>
                </Group>

                <Title order={1} mb="md">
                  {news.title}
                </Title>

                <Text size="sm" c="dimmed" mb="lg">
                  Diperbarui: {formatDate(news.updated_at)}
                </Text>

                {/* Description */}
                <Box
                  mb="xl"
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: news.description,
                  }}
                />

                {/* Media Gallery Section */}
                {(images.length > 1 || videos.length > 0) && (
                  <>
                    <Title order={3} mb="md">
                      Media Gallery
                    </Title>

                    {/* Images Gallery */}
                    {images.length > 1 && (
                      <Box mb="lg">
                        <Text size="sm" fw={500} mb="md" c="dimmed">
                          Gambar ({images.length})
                        </Text>
                        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                          {images.map((image) => (
                            <Box
                              key={image.id}
                              style={{
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                border: selectedMedia?.id === image.id ? '3px solid var(--mantine-color-blue-6)' : 'none',
                              }}
                              onClick={() => {
                                setSelectedMedia(image);
                              }}
                            >
                              <Image
                                src={image.url}
                                alt="Gallery"
                                height={150}
                                fit="cover"
                              />
                              {image.is_cover && (
                                <Badge
                                  size="sm"
                                  style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                  }}
                                >
                                  Cover
                                </Badge>
                              )}
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    {/* Videos Section */}
                    {videos.length > 0 && (
                      <Box mb="lg">
                        <Text size="sm" fw={500} mb="md" c="dimmed">
                          Video ({videos.length})
                        </Text>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                          {videos.map((video) => (
                            <Box
                              key={video.id}
                              style={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                backgroundColor: '#000',
                              }}
                            >
                              <video
                                src={video.url}
                                controls
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: '250px',
                                }}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    {/* Files Section */}
                    {files.length > 0 && (
                      <Box>
                        <Text size="sm" fw={500} mb="md" c="dimmed">
                          File ({files.length})
                        </Text>
                        <SimpleGrid cols={{ base: 1 }} spacing="md">
                          {files.map((file) => (
                            <Button
                              key={file.id}
                              variant="outline"
                              component="a"
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              fullWidth
                            >
                              Download File
                            </Button>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </>
                )}
              </Grid.Col>

              {/* Sidebar - Quick Info */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Box
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <Title order={4} mb="md">
                    Informasi
                  </Title>

                  {/* Asset Summary */}
                  <Box mb="lg">
                    <Text size="sm" fw={500} mb={6}>
                      Total Assets
                    </Text>
                    <Group gap="xs">
                      {images.length > 0 && (
                        <Badge variant="light">
                          {images.length} Gambar
                        </Badge>
                      )}
                      {videos.length > 0 && (
                        <Badge variant="light" color="red">
                          {videos.length} Video
                        </Badge>
                      )}
                      {files.length > 0 && (
                        <Badge variant="light" color="gray">
                          {files.length} File
                        </Badge>
                      )}
                    </Group>
                  </Box>

                  {/* Dates Info */}
                  <Box style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px' }}>
                    <Group justify="space-between" mb="md">
                      <Text size="sm" c="dimmed">
                        Dibuat:
                      </Text>
                      <Text size="sm" fw={500}>
                        {formatDate(news.created_at)}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Dipublikasi:
                      </Text>
                      <Text size="sm" fw={500}>
                        {formatDate(news.published_at)}
                      </Text>
                    </Group>
                  </Box>
                </Box>
              </Grid.Col>
            </Grid>
          </Container>
        </Box>
      </main>

      {/* Image Viewer Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        size="xl"
        centered
        title="Lihat Gambar"
      >
        {selectedMedia?.type === 'image' && (
          <Image
            src={selectedMedia.url}
            alt="Full view"
            fit="contain"
          />
        )}
      </Modal>

      <AppFooter />
    </>
  );
}
