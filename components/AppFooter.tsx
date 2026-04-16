'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Group,
  Text,
  Anchor,
  ActionIcon,
  Divider,
  Modal,
  ScrollArea,
  Button,
} from '@mantine/core';
import {
  IconSchool,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@tabler/icons-react';

interface OrgContact {
  email: string | null;
  phone: string | null;
  logo_url: string | null;
}

const LANDING_PAGE_API =
  '/api/landing-page?key=64b361ca3689e913440e0e79f9d89e81%3Ae43514c4faa690afc6198c800619d4a5681d661b632fb9cccb9147e847856e88a718655bc82a64943f7d3bfc2c803589';

const QUICK_LINKS = [
  { label: 'Beranda', href: '#' },
  { label: 'Upcoming Event', href: '#upcoming' },
  { label: 'Semua Event', href: '#events' },
  { label: 'Gabung Event', href: '#events' },
];

const INFO_LINKS = [
  { label: 'Syarat & Ketentuan', href: '#' },
  { label: 'Kebijakan Privasi', href: '#' },
];

export function AppFooter() {
  const [contact, setContact] = useState<OrgContact>({ email: null, phone: null, logo_url: null });
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyLang, setPrivacyLang] = useState<'id' | 'en'>('id');

  const privacyContent = {
    id: {
      title: 'Kebijakan Privasi',
      lastUpdated: 'Terakhir diperbarui: 11 April 2026',
      sections: [
        { title: '1. Pendahuluan', content: 'IKASMAGABULUKUMBA ("kami", "kami", atau "perusahaan kami") berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda.' },
        { title: '2. Informasi yang Kami Kumpulkan', content: 'Kami mengumpulkan informasi yang Anda berikan secara langsung, termasuk:\n• Nama lengkap\n• Alamat email\n• Nomor telepon\n• Alamat fisik\n• Informasi organisasi\n• Dokumen identitas untuk verifikasi KYC\n• Informasi pembayaran\n• Data acara yang Anda buat' },
        { title: '3. Penggunaan Informasi', content: 'Kami menggunakan informasi Anda untuk:\n• Memproses pendaftaran akun Anda\n• Mengelola verifikasi KYC\n• Memproses pembayaran\n• Berkomunikasi tentang akun dan transaksi Anda\n• Memberikan dukungan pelanggan\n• Mematuhi persyaratan hukum\n• Mencegah penipuan dan penyalahgunaan\n• Meningkatkan layanan kami' },
        { title: '4. Pembagian Informasi', content: 'Kami tidak menjual, memperdagangkan, atau menyewakan informasi pribadi Anda. Kami hanya membagikan informasi Anda dengan:\n• Penyedia layanan pembayaran (untuk memproses pembayaran)\n• Mitra bisnis yang dipilih dengan cermat\n• Pihak berwenang ketika diperlukan oleh hukum\n• Peserta acara Anda (hanya informasi yang diperlukan untuk acara)' },
        { title: '5. Keamanan Data', content: 'Kami menggunakan enkripsi SSL 256-bit dan protokol keamanan industri standar untuk melindungi informasi Anda. Kami mempertahankan standar keamanan fisik, elektronik, dan prosedural untuk melindungi data pribadi Anda dari akses, penggunaan, dan pengungkapan yang tidak sah.' },
        { title: '6. Retensi Data', content: 'Kami menyimpan informasi pribadi Anda selama diperlukan untuk memberikan layanan dan mematuhi kewajiban hukum. Anda dapat meminta penghapusan data Anda kapan saja, kecuali jika kami diwajibkan untuk menyimpannya oleh hukum.' },
        { title: '7. Hak Anda', content: 'Anda memiliki hak untuk:\n• Mengakses data pribadi Anda\n• Memperbaiki data yang tidak akurat\n• Meminta penghapusan data Anda\n• Membatasi pemrosesan data Anda\n• Keberatan terhadap pemrosesan data\n• Portabilitas data Anda' },
        { title: '8. Cookies dan Teknologi Pelacakan', content: 'Kami menggunakan cookies dan teknologi pelacakan serupa untuk meningkatkan pengalaman pengguna. Anda dapat mengontrol pengaturan cookie melalui browser Anda. Pengambilan cookie fungsional dapat mempengaruhi kemampuan Anda untuk menggunakan layanan kami.' },
        { title: '9. Tautan Pihak Ketiga', content: 'Platform kami mungkin berisi tautan ke situs web pihak ketiga. Kami tidak bertanggung jawab atas praktik privasi situs-situs ini. Kami menyarankan Anda untuk meninjau kebijakan privasi mereka sebelum memberikan informasi pribadi Anda.' },
        { title: '10. Perubahan Kebijakan Privasi', content: 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan berlaku segera setelah dipublikasikan di platform. Penggunaan berkelanjutan dari layanan kami menunjukkan penerimaan Anda terhadap kebijakan privasi yang diperbarui.' },
        { title: '11. Hubungi Kami', content: 'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau praktik privasi kami, silakan hubungi kami di:\nEmail: privacy@marathonevents.com\nTelepon: +62-812-3456-789' },
      ],
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: April 11, 2026',
      sections: [
        { title: '1. Introduction', content: 'IKASMAGABULUKUMBA ("we", "us", or "our company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.' },
        { title: '2. Information We Collect', content: 'We collect information that you provide directly to us, including:\n• Full name\n• Email address\n• Phone number\n• Physical address\n• Organization information\n• Identity documents for KYC verification\n• Payment information\n• Event data you create' },
        { title: '3. Use of Information', content: 'We use your information to:\n• Process your account registration\n• Manage KYC verification\n• Process payments\n• Communicate about your account and transactions\n• Provide customer support\n• Comply with legal requirements\n• Prevent fraud and abuse\n• Improve our services' },
        { title: '4. Sharing of Information', content: 'We do not sell, trade, or rent your personal information. We only share your information with:\n• Payment service providers (to process payments)\n• Carefully selected business partners\n• Authorities when required by law\n• Event participants (only information necessary for the event)' },
        { title: '5. Data Security', content: 'We use 256-bit SSL encryption and industry-standard security protocols to protect your information. We maintain physical, electronic, and procedural safeguards to protect your personal data from unauthorized access, use, and disclosure.' },
        { title: '6. Data Retention', content: 'We retain your personal information for as long as necessary to provide services and comply with legal obligations. You may request deletion of your data at any time, unless we are required to retain it by law.' },
        { title: '7. Your Rights', content: 'You have the right to:\n• Access your personal data\n• Correct inaccurate data\n• Request deletion of your data\n• Restrict data processing\n• Object to data processing\n• Data portability' },
        { title: '8. Cookies and Tracking Technologies', content: 'We use cookies and similar tracking technologies to enhance user experience. You can control cookie settings through your browser. Disabling functional cookies may affect your ability to use our services.' },
        { title: '9. Third-Party Links', content: 'Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We recommend reviewing their privacy policies before providing your personal information.' },
        { title: '10. Changes to Privacy Policy', content: 'We may update this Privacy Policy from time to time. Changes will be effective immediately upon publication on the platform. Your continued use of our services indicates your acceptance of the updated privacy policy.' },
        { title: '11. Contact Us', content: 'If you have questions about this Privacy Policy or our privacy practices, please contact us at:\nEmail: privacy@marathonevents.com\nPhone: +62-812-3456-789' },
      ],
    },
  };

  useEffect(() => {
    fetch(LANDING_PAGE_API)
      .then((res) => res.json())
      .then((json) => {
        const org = json?.data?.organization;
        if (org) {
          setContact({ email: org.email ?? null, phone: org.phone ?? null, logo_url: json?.data?.logo_url ?? org.logo_url ?? null });
        }
      })
      .catch(() => {/* silently ignore */});
  }, []);

  const scrollTo = (id: string) => {
    if (id === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Modal
        opened={termsOpen}
        onClose={() => setTermsOpen(false)}
        title={<Text fw={700} size="lg">Syarat &amp; Ketentuan</Text>}
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack gap="md" style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>1. Ketentuan Umum</Text>
            <Text>
              Dengan membeli tiket melalui platform ini, Anda setuju untuk mematuhi semua syarat dan ketentuan yang berlaku. Tiket yang dibeli adalah non-transferable kecuali dengan persetujuan klinis dari penyelenggara event.
            </Text>
          </section>

          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>2. Pembayaran</Text>
            <Text>
              Pembayaran tiket harus dilakukan melalui metode pembayaran yang tersedia di platform. Setiap transaksi pembayaran akan diproses sesuai dengan informasi yang Anda berikan. Platform mengambil biaya 2.5% dari penerimaan penyelenggara acara.
            </Text>
            <Box style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f59f00', padding: '10px 14px', marginTop: 10 }}>
              <Text fw={600} c="#6d4c00" size="sm">
                ⚠️ Biaya Transfer Pembayaran: Setiap biaya transfer atau biaya layanan yang dikenakan oleh metode pembayaran yang dipilih (virtual account, e-wallet, minimarket, dll.) sepenuhnya menjadi tanggung jawab pembeli tiket.
              </Text>
            </Box>
          </section>

          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>3. Kebijakan Refund - PENTING</Text>
            <Box
              style={{
                backgroundColor: '#fff5f5',
                borderLeft: '4px solid #ef4444',
                padding: '12px 16px',
                marginBottom: 12,
              }}
            >
              <Text fw={700} c="#b91c1c" mb={6}>⚠️ Perhatian: Kebijakan Refund</Text>
              <Text c="#b91c1c">
                <strong>Dalam hal refund, harga tiket akan dikembalikan penuh kepada pembeli. Biaya admin transfer dari bank tidak akan dikembalikan kepada pembeli tiket.</strong> Refund hanya dapat diajukan sesuai dengan periode yang telah ditentukan oleh penyelenggara event.
              </Text>
            </Box>
            <Text fw={600} mb={6}>Contoh Kalkulasi Refund:</Text>
            <Stack gap={4} style={{ paddingLeft: 16 }}>
              <Text>• Harga Tiket yang Anda Bayar: Rp 500.000</Text>
              <Text>• Biaya Admin Transfer dari Bank: Rp 12.500</Text>
              <Text>• Penerimaan EO: Rp 500.000</Text>
              <Text fw={700} c="#dc2626">• Jika Refund: Anda menerima Rp 500.000 (harga tiket penuh), EO tidak dapat mengembalikan biaya admin bank Rp 12.500</Text>
            </Stack>
          </section>

          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>4. Pembatalan dan Perubahan Event</Text>
            <Text>
              Penyelenggara event berhak untuk membatalkan, menunda, atau mengubah lokasi dan tanggal event. Dalam hal pembatalan event oleh penyelenggara, Anda berhak mendapatkan refund penuh dari harga tiket (tanpa mengurangi biaya platform yang telah dikonsumsi).
            </Text>
          </section>

          <Box
            style={{
              backgroundColor: '#fefce8',
              borderLeft: '4px solid #ca8a04',
              padding: '12px 16px',
            }}
          >
            <Text fw={700} size="md" c="#111827" mb={6}>5. Batasan Tanggung Jawab Platform</Text>
            <Text c="#111827">
              <strong>Platform TIDAK bertanggung jawab atas perubahan, penundaan, atau pembatalan event.</strong> Semua keputusan terkait dengan perubahan atau pembatalan event sepenuhnya menjadi tanggung jawab event organizer/penyelenggara. Platform hanya bertindak sebagai penyedia layanan ticketing dan tidak memiliki kontrol atas pelaksanaan event.
            </Text>
          </Box>

          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>6. Data Pribadi</Text>
            <Text>
              Informasi pribadi yang Anda berikan akan digunakan untuk keperluan administrasi event dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda. Data akan disimpan sesuai dengan kebijakan privasi kami.
            </Text>
          </section>

          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>7. Tanggung Jawab Peserta</Text>
            <Text>
              Peserta event setuju untuk mematuhi semua peraturan yang berlaku di lokasi event. Peserta bertanggung jawab atas keselamatan pribadi mereka. Penyelenggara event tidak bertanggung jawab atas kehilangan, kerusakan, atau pencurian barang pribadi selama event.
            </Text>
          </section>

          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>8. Hak Penyelenggara</Text>
            <Text>
              Penyelenggara event berhak untuk menolak masuk atau mengeluarkan peserta yang melanggar kebijakan atau menciptakan gangguan selama event. Tidak ada refund dalam kasus seperti ini.
            </Text>
          </section>

          <section>
            <Text fw={700} size="md" c="#111827" mb={6}>9. Perubahan Syarat dan Ketentuan</Text>
            <Text>
              Kami berhak untuk mengubah syarat dan ketentuan ini kapan saja. Perubahan akan berlaku efektif setelah diumumkan. Penggunaan berkelanjutan dari platform ini berarti Anda menerima perubahan tersebut.
            </Text>
          </section>

          <Box
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <Text size="xs" c="#4b5563">
              <strong>Terakhir diperbarui:</strong> 12 April 2026
            </Text>
          </Box>
        </Stack>
      </Modal>

      <Modal
        opened={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title={
          <Group justify="space-between" align="center" style={{ flex: 1, paddingRight: 16 }}>
            <Text fw={700} size="lg">{privacyContent[privacyLang].title}</Text>
            <Group gap="xs">
              <Button variant={privacyLang === 'id' ? 'filled' : 'light'} size="xs" onClick={() => setPrivacyLang('id')}>Bahasa Indonesia</Button>
              <Button variant={privacyLang === 'en' ? 'filled' : 'light'} size="xs" onClick={() => setPrivacyLang('en')}>English</Button>
            </Group>
          </Group>
        }
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack gap="md" style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
          <Text size="xs" c="#6b7280">{privacyContent[privacyLang].lastUpdated}</Text>
          {privacyContent[privacyLang].sections.map((section, idx) => (
            <section key={idx}>
              <Text fw={700} size="md" c="#111827" mb={6}>{section.title}</Text>
              <Text style={{ whiteSpace: 'pre-line' }}>{section.content}</Text>
            </section>
          ))}
        </Stack>
      </Modal>

      <Box
        id="footer"
        component="footer"
      style={{
        backgroundColor: '#0f1923',
        color: 'white',
        paddingTop: 64,
        paddingBottom: 32,
      }}
    >
      <Container size="lg">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" mb={48}>
          {/* Brand Column */}
          <Stack gap="md">
            <Group gap="xs">
              {contact.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={contact.logo_url}
                  alt="Logo"
                  style={{ height: 32, width: 'auto', objectFit: 'contain' }}
                />
              ) : (
                <IconSchool size={28} color="#74c0fc" />
              )}
              <Text fw={800} size="md" style={{ letterSpacing: '-0.3px' }}>
                IKASMAGABULUKUMBA
              </Text>
            </Group>
            <Text
              c="rgba(255,255,255,0.55)"
              size="sm"
              style={{ lineHeight: 1.75 }}
            >
              Ikatan Alumni SMAN 1 Bulukumba. Menghubungkan alumni dari seluruh
              penjuru nusantara melalui kegiatan yang bermakna.
            </Text>

            {/* Social Media */}
            <Group gap="xs" mt={4}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
                component="a"
                href="https://www.instagram.com/ikasmagabulukumba/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram IKASMAGABULUKUMBA"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <IconBrandInstagram size={20} />
              </ActionIcon>
              {/* <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook IKASMAGABULUKUMBA"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <IconBrandFacebook size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
                component="a"
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp IKASMAGABULUKUMBA"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <IconBrandWhatsapp size={20} />
              </ActionIcon> */}
            </Group>
          </Stack>

          {/* Navigation Column */}
          <Stack gap="sm">
            <Text
              fw={600}
              size="xs"
              tt="uppercase"
              c="rgba(255,255,255,0.4)"
              style={{ letterSpacing: '0.8px' }}
            >
              Navigasi
            </Text>
            {QUICK_LINKS.map((link) => (
              <Text
                key={link.label}
                size="sm"
                c="rgba(255,255,255,0.65)"
                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                onClick={() => scrollTo(link.href)}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = 'white')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color =
                    'rgba(255,255,255,0.65)')
                }
              >
                {link.label}
              </Text>
            ))}
          </Stack>

          {/* Info Column */}
          <Stack gap="sm">
            <Text
              fw={600}
              size="xs"
              tt="uppercase"
              c="rgba(255,255,255,0.4)"
              style={{ letterSpacing: '0.8px' }}
            >
              Informasi
            </Text>
            {INFO_LINKS.map((link) =>
              link.label === 'Syarat & Ketentuan' || link.label === 'Kebijakan Privasi' ? (
                <Text
                  key={link.label}
                  size="sm"
                  c="rgba(255,255,255,0.65)"
                  style={{ cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' }}
                  onClick={() => link.label === 'Syarat & Ketentuan' ? setTermsOpen(true) : setPrivacyOpen(true)}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = 'white')
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color =
                      'rgba(255,255,255,0.65)')
                  }
                >
                  {link.label}
                </Text>
              ) : (
                <Anchor
                  key={link.label}
                  href={link.href}
                  c="rgba(255,255,255,0.65)"
                  size="sm"
                  style={{ textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = 'white')
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color =
                      'rgba(255,255,255,0.65)')
                  }
                >
                  {link.label}
                </Anchor>
              )
            )}
          </Stack>

          {/* Contact Column */}
          <Stack gap="sm">
            <Text
              fw={600}
              size="xs"
              tt="uppercase"
              c="rgba(255,255,255,0.4)"
              style={{ letterSpacing: '0.8px' }}
            >
              Kontak
            </Text>
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <IconMapPin
                size={16}
                color="#74c0fc"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Text c="rgba(255,255,255,0.65)" size="sm" style={{ lineHeight: 1.6 }}>
                Jl. Pendidikan Kel. Tanaberu, Kec. Bontobahari, 
                <br />
                Kab. Bulukumba, Sulawesi Selatan
              </Text>
            </Group>
            <Group gap="xs">
              <IconPhone size={16} color="#74c0fc" style={{ flexShrink: 0 }} />
              {contact.phone ? (
                <Anchor
                  href={`tel:${contact.phone}`}
                  c="rgba(255,255,255,0.65)"
                  size="sm"
                  style={{ textDecoration: 'none' }}
                >
                  {contact.phone}
                </Anchor>
              ) : (
                <Text c="rgba(255,255,255,0.65)" size="sm">-</Text>
              )}
            </Group>
            <Group gap="xs">
              <IconMail size={16} color="#74c0fc" style={{ flexShrink: 0 }} />
              {contact.email ? (
                <Anchor
                  href={`mailto:${contact.email}`}
                  c="rgba(255,255,255,0.65)"
                  size="sm"
                  style={{ textDecoration: 'none' }}
                >
                  {contact.email}
                </Anchor>
              ) : (
                <Text c="rgba(255,255,255,0.65)" size="sm">-</Text>
              )}
            </Group>
          </Stack>
        </SimpleGrid>

        <Divider color="rgba(255,255,255,0.08)" />

        <Group justify="space-between" mt="lg" wrap="wrap" gap="sm">
          <Text c="rgba(255,255,255,0.35)" size="xs">
            © {new Date().getFullYear()} IKASMAGABULUKUMBA. All rights reserved.
          </Text>
          <Text c="rgba(255,255,255,0.35)" size="xs">
            Dibuat dengan ❤️ untuk alumni SMAN 1 Bulukumba
          </Text>
        </Group>

        <Group justify="center" mt="md" gap="xs" wrap="wrap">
          <Text c="rgba(255,255,255,0.35)" size="xs">
            Powered by
          </Text>
          <Anchor
            href="https://paradox.web.id"
            target="_blank"
            rel="noopener noreferrer"
            c="rgba(255,255,255,0.55)"
            size="xs"
            style={{ textDecoration: 'none' }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)')
            }
          >
            Paradox
          </Anchor>
          <Text c="rgba(255,255,255,0.35)" size="xs">
            &
          </Text>
          <Anchor
            href="https://ayolari.web.id"
            target="_blank"
            rel="noopener noreferrer"
            c="rgba(255,255,255,0.55)"
            size="xs"
            style={{ textDecoration: 'none' }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)')
            }
          >
            AyoLari
          </Anchor>
        </Group>
      </Container>
    </Box>
    </>
  );
}
