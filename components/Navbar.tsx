'use client';

import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Box,
  Container,
  Group,
  Text,
  Anchor,
  Button,
  Burger,
  Drawer,
  Stack,
  Image,
} from '@mantine/core';
import { IconSchool } from '@tabler/icons-react';

const NAV_LINKS = [
  { href: '#upcoming', label: 'Upcoming' },
  { href: '#events', label: 'Semua Event' },
  { href: '#footer', label: 'Kontak' },
];

interface NavbarLandingPageData {
  data?: {
    logo_url?: string;
    organization?: {
      name?: string;
    };
  };
}

export function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [landingPageData, setLandingPageData] = useState<NavbarLandingPageData | null>(null);

  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
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

  const apiData = landingPageData?.data || {};
  const logoUrl = apiData.logo_url;

  const scrollTo = (id: string) => {
    close();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e9ecef',
      }}
    >
      <Container size="lg">
        <Group justify="space-between" h={64}>
          {/* Logo */}
          <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt="Logo" 
                height={28}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <IconSchool size={28} color="#1971C2" />
            )}
            <Text fw={800} size="md" style={{ letterSpacing: '-0.4px', color: '#1a1a2e' }}>
              IKASMAGABULUKUMBA
            </Text>
          </Group>

          {/* Desktop Nav */}
          <Group gap="xl" visibleFrom="sm">
            {NAV_LINKS.map((link) => (
              <Anchor
                key={link.href}
                component="button"
                c="dark"
                fw={500}
                size="sm"
                style={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => scrollTo(link.href)}
              >
                {link.label}
              </Anchor>
            ))}
            <Button
              size="sm"
              radius="xl"
              onClick={() => scrollTo('#events')}
            >
              Daftar Event
            </Button>
          </Group>

          {/* Mobile Burger */}
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title={
          <Group gap="xs">
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt="Logo" 
                height={22}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <IconSchool size={22} color="#1971C2" />
            )}
            <Text fw={700} size="sm">
              IKASMAGABULUKUMBA
            </Text>
          </Group>
        }
        padding="lg"
        size="xs"
        position="right"
      >
        <Stack gap="lg" pt="md">
          {NAV_LINKS.map((link) => (
            <Text
              key={link.href}
              fw={500}
              size="md"
              style={{ cursor: 'pointer' }}
              onClick={() => scrollTo(link.href)}
            >
              {link.label}
            </Text>
          ))}
          <Button radius="xl" fullWidth onClick={() => scrollTo('#events')}>
            Daftar Event
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
