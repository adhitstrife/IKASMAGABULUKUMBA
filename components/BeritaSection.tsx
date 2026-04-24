'use client';

import { Box, Container, SimpleGrid, Image, Title, Text } from '@mantine/core';

const gambarList = [
  '/berita/berita_1.jpeg',
  '/berita/berita_2.jpeg',
];

export function BeritaSection() {
  return (
    <Box py={80} style={{ backgroundColor: '#f8fafc' }}>
      <Container size="lg">
        <Box mb="xl" ta="center">
          <Text
            size="sm"
            fw={700}
            tt="uppercase"
            c="blue"
            mb={6}
            style={{ letterSpacing: '0.6px' }}
          >
            Informasi Terkini
          </Text>
          <Title order={2} style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
            Berita
          </Title>
        </Box>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {gambarList.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`Berita ${i + 1}`}
              radius="xl"
              fit="cover"
            />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
