'use client';

import { Box, Container, Title, Text, Button, Group, ThemeIcon } from '@mantine/core';
import { IconCalendarEvent, IconArrowRight, IconSparkles } from '@tabler/icons-react';

export function CallToAction() {
  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      py={100}
      style={{
        background: 'linear-gradient(135deg, #1971C2 0%, #0c47a1 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <Box
        style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      <Container size="md" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <ThemeIcon
          size={72}
          radius="xl"
          mb="xl"
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            margin: '0 auto 2rem',
          }}
        >
          <IconSparkles size={36} color="white" />
        </ThemeIcon>

        <Title
          order={2}
          c="white"
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.8px',
            lineHeight: 1.2,
          }}
        >
          Siap untuk Event Berikutnya?
        </Title>

        <Text
          c="rgba(255,255,255,0.78)"
          size="lg"
          mt="md"
          mb={40}
          maw={500}
          mx="auto"
          style={{ lineHeight: 1.75 }}
        >
          Bergabunglah bersama ratusan alumni aktif dan jadilah bagian dari
          komunitas yang terus berkembang.{' '}
          <Text component="span" fw={700} c="white">
            Jangan sampai ketinggalan!
          </Text>
        </Text>

        <Group justify="center" gap="md">
          <Button
            size="lg"
            radius="xl"
            leftSection={<IconCalendarEvent size={20} />}
            onClick={scrollToEvents}
            style={{
              backgroundColor: 'white',
              color: '#1971C2',
              fontWeight: 700,
              paddingLeft: 28,
              paddingRight: 28,
            }}
          >
            Gabung Event Sekarang
          </Button>
          <Button
            size="lg"
            radius="xl"
            variant="outline"
            rightSection={<IconArrowRight size={18} />}
            style={{
              borderColor: 'rgba(255,255,255,0.4)',
              color: 'white',
            }}
          >
            Pelajari Lebih Lanjut
          </Button>
        </Group>
      </Container>
    </Box>
  );
}
