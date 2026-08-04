import { Container } from '@mantine/core';
import { EventOverview } from '@/components/eo/EventOverview';

export default function EoEventDetailPage({ params }: { params: { eventId: string } }) {
  return <Container size="xl" py="xl"><EventOverview eventId={params.eventId} /></Container>;
}
