import { Container } from '@mantine/core';
import { TicketAddons } from '@/components/eo/TicketManagement';
export default function TicketAddonsPage({ params }: { params: { eventId: string; additionId: string; ticketId: string } }) { return <Container size="lg" py="xl"><TicketAddons {...params} /></Container>; }
