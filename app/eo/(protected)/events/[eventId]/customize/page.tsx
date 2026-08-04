import { Container, Paper } from '@mantine/core'; import { EventSettings } from '@/components/eo/EventSettings';
export default function Page({ params }: { params: { eventId: string } }) { return <Container size="md" py="xl"><Paper withBorder radius="lg" p="xl"><EventSettings eventId={params.eventId} customization/></Paper></Container>; }
