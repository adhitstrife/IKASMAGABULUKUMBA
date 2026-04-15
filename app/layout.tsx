import type { Metadata } from 'next';
import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import './globals.css';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '700',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Card: {
      defaultProps: {
        radius: 'xl',
      },
    },
  },
});

export const metadata: Metadata = {
  title: 'IKASMAGABULUKUMBA — Event Alumni',
  description:
    'Temukan dan ikuti berbagai kegiatan alumni SMAN 1 Bulukumba. Reuni, seminar, olahraga, dan banyak lagi.',
  keywords: 'ikasmagabulukumba, alumni, event, bulukumba, sman 1 bulukumba',
  authors: [{ name: 'AyoLari Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'IKASMAGABULUKUMBA — Event Alumni',
    description:
      'Temukan dan ikuti berbagai kegiatan alumni SMAN 1 Bulukumba.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <ColorSchemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
