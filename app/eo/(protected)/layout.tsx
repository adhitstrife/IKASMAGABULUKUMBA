import { redirect } from 'next/navigation';
import { getEoToken } from '@/lib/eo-auth';
import { EoShell } from '@/components/eo/EoShell';

export default function ProtectedEoLayout({ children }: { children: React.ReactNode }) {
  if (!getEoToken()) redirect('/eo/login');
  return <EoShell>{children}</EoShell>;
}
