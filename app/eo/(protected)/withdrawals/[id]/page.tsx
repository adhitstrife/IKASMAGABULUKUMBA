import { Container } from '@mantine/core';import { WithdrawalDetail } from '@/components/eo/Withdrawals';
export default function Page({params}:{params:{id:string}}){return <Container size="md" py="xl"><WithdrawalDetail id={params.id}/></Container>}
