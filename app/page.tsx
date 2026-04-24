'use client';

import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { UpcomingHighlight } from '@/components/UpcomingHighlight';
import { EventList } from '@/components/EventList';
import { BeritaSection } from '@/components/BeritaSection';
import { CallToAction } from '@/components/CallToAction';
import { AppFooter } from '@/components/AppFooter';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <UpcomingHighlight />
        <BeritaSection />
        <EventList />
        <CallToAction />
      </main>
      <AppFooter />
    </>
  );
}
