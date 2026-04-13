'use client';

import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Group,
  Text,
  Anchor,
  ActionIcon,
  Divider,
} from '@mantine/core';
import {
  IconSchool,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@tabler/icons-react';

const QUICK_LINKS = [
  { label: 'Beranda', href: '#' },
  { label: 'Upcoming Event', href: '#upcoming' },
  { label: 'Semua Event', href: '#events' },
  { label: 'Gabung Event', href: '#events' },
];

const INFO_LINKS = [
  { label: 'Cara Daftar Event', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Syarat & Ketentuan', href: '#' },
  { label: 'Kebijakan Privasi', href: '#' },
];

export function AppFooter() {
  const scrollTo = (id: string) => {
    if (id === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      id="footer"
      component="footer"
      style={{
        backgroundColor: '#0f1923',
        color: 'white',
        paddingTop: 64,
        paddingBottom: 32,
      }}
    >
      <Container size="lg">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" mb={48}>
          {/* Brand Column */}
          <Stack gap="md">
            <Group gap="xs">
              <IconSchool size={28} color="#74c0fc" />
              <Text fw={800} size="md" style={{ letterSpacing: '-0.3px' }}>
                IKASMAGABULUKUMBA
              </Text>
            </Group>
            <Text
              c="rgba(255,255,255,0.55)"
              size="sm"
              style={{ lineHeight: 1.75 }}
            >
              Ikatan Alumni SMAN 1 Bulukumba. Menghubungkan alumni dari seluruh
              penjuru nusantara melalui kegiatan yang bermakna.
            </Text>

            {/* Social Media */}
            <Group gap="xs" mt={4}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram IKASMAGABULUKUMBA"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <IconBrandInstagram size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook IKASMAGABULUKUMBA"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <IconBrandFacebook size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
                component="a"
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp IKASMAGABULUKUMBA"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <IconBrandWhatsapp size={20} />
              </ActionIcon>
            </Group>
          </Stack>

          {/* Navigation Column */}
          <Stack gap="sm">
            <Text
              fw={600}
              size="xs"
              tt="uppercase"
              c="rgba(255,255,255,0.4)"
              style={{ letterSpacing: '0.8px' }}
            >
              Navigasi
            </Text>
            {QUICK_LINKS.map((link) => (
              <Text
                key={link.label}
                size="sm"
                c="rgba(255,255,255,0.65)"
                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                onClick={() => scrollTo(link.href)}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = 'white')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color =
                    'rgba(255,255,255,0.65)')
                }
              >
                {link.label}
              </Text>
            ))}
          </Stack>

          {/* Info Column */}
          <Stack gap="sm">
            <Text
              fw={600}
              size="xs"
              tt="uppercase"
              c="rgba(255,255,255,0.4)"
              style={{ letterSpacing: '0.8px' }}
            >
              Informasi
            </Text>
            {INFO_LINKS.map((link) => (
              <Anchor
                key={link.label}
                href={link.href}
                c="rgba(255,255,255,0.65)"
                size="sm"
                style={{ textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = 'white')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color =
                    'rgba(255,255,255,0.65)')
                }
              >
                {link.label}
              </Anchor>
            ))}
          </Stack>

          {/* Contact Column */}
          <Stack gap="sm">
            <Text
              fw={600}
              size="xs"
              tt="uppercase"
              c="rgba(255,255,255,0.4)"
              style={{ letterSpacing: '0.8px' }}
            >
              Kontak
            </Text>
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <IconMapPin
                size={16}
                color="#74c0fc"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Text c="rgba(255,255,255,0.65)" size="sm" style={{ lineHeight: 1.6 }}>
                Jl. K.H. Wahid Hasyim No.1,
                <br />
                Bulukumba, Sulawesi Selatan
              </Text>
            </Group>
            <Group gap="xs">
              <IconPhone size={16} color="#74c0fc" style={{ flexShrink: 0 }} />
              <Anchor
                href="tel:+6281234567890"
                c="rgba(255,255,255,0.65)"
                size="sm"
                style={{ textDecoration: 'none' }}
              >
                +62 812-3456-7890
              </Anchor>
            </Group>
            <Group gap="xs">
              <IconMail size={16} color="#74c0fc" style={{ flexShrink: 0 }} />
              <Anchor
                href="mailto:info@ikasmagabulukumba.id"
                c="rgba(255,255,255,0.65)"
                size="sm"
                style={{ textDecoration: 'none' }}
              >
                info@ikasmagabulukumba.id
              </Anchor>
            </Group>
          </Stack>
        </SimpleGrid>

        <Divider color="rgba(255,255,255,0.08)" />

        <Group justify="space-between" mt="lg" wrap="wrap" gap="sm">
          <Text c="rgba(255,255,255,0.35)" size="xs">
            © {new Date().getFullYear()} IKASMAGABULUKUMBA. All rights reserved.
          </Text>
          <Text c="rgba(255,255,255,0.35)" size="xs">
            Dibuat dengan ❤️ untuk alumni SMAN 1 Bulukumba
          </Text>
        </Group>

        <Group justify="center" mt="md" gap="xs" wrap="wrap">
          <Text c="rgba(255,255,255,0.35)" size="xs">
            Powered by
          </Text>
          <Anchor
            href="https://paradox.web.id"
            target="_blank"
            rel="noopener noreferrer"
            c="rgba(255,255,255,0.55)"
            size="xs"
            style={{ textDecoration: 'none' }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)')
            }
          >
            Paradox
          </Anchor>
          <Text c="rgba(255,255,255,0.35)" size="xs">
            &
          </Text>
          <Anchor
            href="https://ayolari.web.id"
            target="_blank"
            rel="noopener noreferrer"
            c="rgba(255,255,255,0.55)"
            size="xs"
            style={{ textDecoration: 'none' }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)')
            }
          >
            AyoLari
          </Anchor>
        </Group>
      </Container>
    </Box>
  );
}
