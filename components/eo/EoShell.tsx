'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Divider,
  Group,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconBuildingStore,
  IconCalendarEvent,
  IconChartBar,
  IconChevronLeft,
  IconCreditCard,
  IconFileText,
  IconLayoutDashboard,
  IconLogout,
  IconNews,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

const links = [
  { href: '/eo', label: 'Ringkasan', icon: IconLayoutDashboard },
  { href: '/eo/events', label: 'Event', icon: IconCalendarEvent },
  { href: '/eo/participants', label: 'Peserta', icon: IconUsers },
  { href: '/eo/news', label: 'Berita', icon: IconNews },
  { href: '/eo/withdrawals', label: 'Keuangan', icon: IconCreditCard },
  { href: '/eo/settings', label: 'Pengaturan', icon: IconSettings },
  { href: '/eo/landing-page', label: 'Landing Page', icon: IconFileText },
  { href: '/eo/integration', label: 'Integrasi', icon: IconChartBar },
];

export function EoShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/eo/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/eo/login');
      router.refresh();
    }
  };

  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header px="lg">
        <Group h="100%" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <ThemeIcon variant="light" color="blue" size={38} radius="md">
              <IconBuildingStore size={21} />
            </ThemeIcon>
            <div>
              <Text fw={800} size="sm">Portal EO</Text>
              <Text c="dimmed" size="xs">IKASMAGABULUKUMBA</Text>
            </div>
          </Group>
          <Tooltip label="Kembali ke situs publik">
            <ActionIcon component={Link} href="/" variant="subtle" color="gray" aria-label="Kembali ke situs publik">
              <IconArrowLeft size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Stack justify="space-between" h="100%">
          <div>
            <Text tt="uppercase" c="dimmed" size="xs" fw={700} px="sm" mb="xs">Kelola Organisasi</Text>
            {links.map(({ href, label, icon: Icon }) => (
              <NavLink
                component={Link}
                href={href}
                key={href}
                label={label}
                leftSection={<Icon size={18} stroke={1.8} />}
                active={href === '/eo' ? pathname === href : pathname.startsWith(href)}
                onClick={close}
                variant="light"
                color="blue"
                mb={4}
              />
            ))}
            <Divider my="md" />
          </div>
          <Button
            variant="subtle"
            color="red"
            justify="space-between"
            rightSection={<IconChevronLeft size={16} />}
            leftSection={<IconLogout size={17} />}
            onClick={logout}
            loading={loggingOut}
          >
            Keluar
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
