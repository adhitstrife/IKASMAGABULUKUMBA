import Link from 'next/link';
import { Button, Container, Stack, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { EventList } from '@/components/eo/EventManagement';

export default function EoEventsPage() {
  return <Container size="xl" py="xl"><Stack><Button component={Link} href="/eo/events/create" leftSection={<IconPlus size={17} />} ml="auto">Buat event</Button><Title order={1}>Event</Title><EventList /></Stack></Container>;
}
