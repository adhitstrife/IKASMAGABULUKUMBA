export type EventCategory = 'seminar' | 'olahraga' | 'reuni' | 'sosial' | 'workshop';

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  isOnline: boolean;
  price: number | null; // null = gratis
  category: EventCategory;
  image: string;
  description: string;
  isFeatured?: boolean;
  seats: number;
  registeredCount: number;
  organizer: string;
}

export const CATEGORY_OPTIONS = [
  { value: 'seminar', label: 'Seminar' },
  { value: 'olahraga', label: 'Olahraga' },
  { value: 'reuni', label: 'Reuni' },
  { value: 'sosial', label: 'Sosial' },
  { value: 'workshop', label: 'Workshop' },
] as const;

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  seminar: 'blue',
  olahraga: 'green',
  reuni: 'violet',
  sosial: 'orange',
  workshop: 'teal',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  seminar: 'Seminar',
  olahraga: 'Olahraga',
  reuni: 'Reuni',
  sosial: 'Sosial',
  workshop: 'Workshop',
};

export const events: Event[] = [
  {
    id: '1',
    title: 'Reuni Akbar IKASMAGABULUKUMBA 2026',
    date: '2026-05-15',
    location: 'Gedung Serbaguna, Bulukumba',
    isOnline: false,
    price: 150000,
    category: 'reuni',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    description:
      'Reuni besar-besaran seluruh angkatan alumni SMAN 1 Bulukumba. Reconnect dengan teman lama, rayakan kebersamaan, dan bangun koneksi baru.',
    isFeatured: true,
    seats: 500,
    registeredCount: 312,
    organizer: 'Pengurus IKASMAGABULUKUMBA',
  },
  {
    id: '2',
    title: 'Seminar Karier & Entrepreneurship',
    date: '2026-04-28',
    location: 'Online (Zoom)',
    isOnline: true,
    price: null,
    category: 'seminar',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    description:
      'Belajar dari alumni sukses tentang karier dan wirausaha. Sesi tanya jawab langsung dengan pembicara berpengalaman. Gratis untuk semua alumni.',
    isFeatured: true,
    seats: 200,
    registeredCount: 178,
    organizer: 'Divisi Pengembangan SDM',
  },
  {
    id: '3',
    title: 'Turnamen Futsal Alumni Cup 2026',
    date: '2026-06-01',
    location: 'GOR Bulukumba',
    isOnline: false,
    price: 50000,
    category: 'olahraga',
    image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&auto=format&fit=crop&q=80',
    description:
      'Turnamen futsal antar angkatan alumni. Daftarkan tim kamu sekarang dan buktikan siapa yang terbaik!',
    isFeatured: false,
    seats: 100,
    registeredCount: 64,
    organizer: 'Divisi Olahraga',
  },
  {
    id: '4',
    title: 'Workshop Digital Marketing 2026',
    date: '2026-05-10',
    location: 'Online (Google Meet)',
    isOnline: true,
    price: 75000,
    category: 'workshop',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f5a07b?w=800&auto=format&fit=crop&q=80',
    description:
      'Pelajari strategi digital marketing dari praktisi berpengalaman. Dapatkan sertifikat keikutsertaan dan materi eksklusif.',
    isFeatured: false,
    seats: 50,
    registeredCount: 42,
    organizer: 'Divisi Teknologi & Digital',
  },
  {
    id: '5',
    title: 'Bakti Sosial & Donor Darah',
    date: '2026-04-25',
    location: 'SMAN 1 Bulukumba',
    isOnline: false,
    price: null,
    category: 'sosial',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80',
    description:
      'Kegiatan bakti sosial dan donor darah untuk masyarakat Bulukumba. Bersama kita bisa berbuat lebih banyak.',
    isFeatured: false,
    seats: 300,
    registeredCount: 145,
    organizer: 'Divisi Sosial',
  },
  {
    id: '6',
    title: 'Alumni Talk: Berkarier di Tech Industry',
    date: '2026-05-22',
    location: 'Online (Zoom)',
    isOnline: true,
    price: null,
    category: 'seminar',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    description:
      'Ngobrol santai dengan alumni yang berkarier di industri teknologi. Q&A session terbuka untuk semua peserta.',
    isFeatured: false,
    seats: 150,
    registeredCount: 89,
    organizer: 'Divisi Teknologi & Digital',
  },
  {
    id: '7',
    title: 'Gathering Alumni Angkatan 2010',
    date: '2026-07-04',
    location: 'Pantai Tanjung Bira, Bulukumba',
    isOnline: false,
    price: 100000,
    category: 'reuni',
    image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&auto=format&fit=crop&q=80',
    description:
      'Gathering khusus angkatan 2010. Rayakan 16 tahun kebersamaan di tepi pantai yang indah.',
    isFeatured: false,
    seats: 80,
    registeredCount: 55,
    organizer: 'Angkatan 2010',
  },
  {
    id: '8',
    title: 'Workshop Public Speaking',
    date: '2026-06-15',
    location: 'Aula Kantor IKASMAGABULUKUMBA',
    isOnline: false,
    price: 100000,
    category: 'workshop',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    description:
      'Tingkatkan kemampuan berbicara di depan umum bersama trainer berpengalaman. Kapasitas terbatas, segera daftar!',
    isFeatured: false,
    seats: 30,
    registeredCount: 28,
    organizer: 'Divisi Pengembangan SDM',
  },
];
