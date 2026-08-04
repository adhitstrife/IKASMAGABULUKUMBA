import { Container, Paper } from '@mantine/core';import { AdditionSettings } from '@/components/eo/AdditionSettings';
export default function Page({params}:{params:{eventId:string;additionId:string}}){return <Container size="md" py="xl"><Paper withBorder radius="lg" p="xl"><AdditionSettings {...params}/></Paper></Container>}
