import { Container, Paper, Stack, Title } from '@mantine/core';
import { CreateEventForm } from '@/components/eo/EventManagement';

export default function EoCreateEventPage() {
  return <Container size="md" py="xl"><Stack><Title order={1}>Buat event</Title><Paper withBorder radius="lg" p="xl"><CreateEventForm /></Paper></Stack></Container>;
}
