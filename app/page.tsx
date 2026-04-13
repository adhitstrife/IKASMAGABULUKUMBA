'use client';

import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { UpcomingHighlight } from '@/components/UpcomingHighlight';
import { EventList } from '@/components/EventList';
import { CallToAction } from '@/components/CallToAction';
import { AppFooter } from '@/components/AppFooter';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <UpcomingHighlight />
        <EventList />
        <CallToAction />
      </main>
      <AppFooter />
    </>
  );
}
