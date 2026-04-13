'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Title, Text, Button, Group } from '@mantine/core';
import { IconCalendarEvent, IconArrowRight } from '@tabler/icons-react';

const STATS = [
  { value: '500+', label: 'Alumni Aktif' },
  { value: '20+', label: 'Event Per Tahun' },
  { value: '10+', label: 'Tahun Berdiri' },
];

export function HeroSection() {
  const [landingPageData, setLandingPageData] = useState(null);

  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        // In client components, NEXT_PUBLIC_ env vars are available in code
        const url = `/api/landing-page?key=${encodeURIComponent(process.env.NEXT_PUBLIC_ORG_SECRET_KEY || '')}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('Landing page data from API proxy:', data);
        setLandingPageData(data);
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      }
    };

    fetchLandingPageData();
  }, []);

  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Extract API data if available
  const apiData = landingPageData?.data || {};
  const heroBgUrl = apiData.hero_background_url;
  const heroTitle = apiData.hero_title || 'Jangan Lewatkan Event Alumni Terbaikmu';
  const heroSubtitle = apiData.hero_subtitle || 'Temukan dan ikuti berbagai kegiatan alumni terbaru — reuni, seminar, olahraga, dan banyak lagi.';
  const ctaText = apiData.hero_cta_text || 'Lihat Event';
  const ctaLink = apiData.hero_cta_link;

  return (
    <Box
      style={{
        background: heroBgUrl 
          ? `linear-gradient(135deg, rgba(25, 113, 194, 0.8) 0%, rgba(12, 71, 161, 0.8) 55%, rgba(26, 26, 46, 0.8) 100%), url(${heroBgUrl})`
          : 'linear-gradient(135deg, #1971C2 0%, #0c47a1 55%, #1a1a2e 100%)',
        backgroundSize: heroBgUrl ? 'cover' : 'auto',
        backgroundPosition: 'center',
        paddingTop: 80,
        paddingBottom: 100,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <Box
        style={{
          position: 'absolute',
          top: '-40%',
          right: '-15%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-8%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Box maw={740}>
          {/* Tag */}
          <Box
            mb="md"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 999,
              padding: '6px 14px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#69db7c',
              }}
            />
            <Text size="sm" fw={600} c="white">
              Alumni SMAN 1 Bulukumba
            </Text>
          </Box>

          {/* Headline */}
          <Title
            order={1}
            c="white"
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-1.5px',
            }}
          >
            {heroTitle}
          </Title>

          {/* Subheadline */}
          <Text
            c="rgba(255,255,255,0.72)"
            size="xl"
            mt="lg"
            maw={560}
            style={{ lineHeight: 1.75 }}
          >
            {heroSubtitle}
          </Text>

          {/* CTA Buttons */}
          <Group mt={40} gap="md">
            <Button
              size="lg"
              radius="xl"
              leftSection={<IconCalendarEvent size={20} />}
              onClick={ctaLink ? () => window.location.href = ctaLink : scrollToEvents}
              style={{
                backgroundColor: 'white',
                color: '#1971C2',
                fontWeight: 700,
              }}
            >
              {ctaText}
            </Button>
            {/* <Button
              size="lg"
              radius="xl"
              variant="outline"
              rightSection={<IconArrowRight size={18} />}
              onClick={scrollToEvents}
              style={{
                borderColor: 'rgba(255,255,255,0.45)',
                color: 'white',
              }}
            >
              Daftar Sekarang
            </Button> */}
          </Group>

          {/* Stats */}
          <Group mt={52} gap={40}>
            {STATS.map((stat) => (
              <Box key={stat.label}>
                <Text c="white" fw={800} style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                  {stat.value}
                </Text>
                <Text c="rgba(255,255,255,0.55)" size="sm" mt={4}>
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Group>
        </Box>
      </Container>
    </Box>
  );
}
