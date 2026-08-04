import { Container } from '@mantine/core'; import { NewsEditor } from '@/components/eo/NewsEditor';
export default function Page({ params }: { params: { newsId: string } }) { return <Container size="md" py="xl"><NewsEditor newsId={params.newsId} /></Container>; }
