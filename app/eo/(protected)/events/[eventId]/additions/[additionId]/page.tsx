import { Container } from '@mantine/core';
import { AdditionTickets } from '@/components/eo/TicketManagement';

export default function EoAdditionPage({ params }: { params: { eventId: string; additionId: string } }) {
  return <Container size="xl" py="xl"><AdditionTickets eventId={params.eventId} additionId={params.additionId} /></Container>;
}
