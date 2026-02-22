import type { Metadata } from 'next';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

export const metadata: Metadata = {
  title: 'Verificación - Ticketera 2.0',
  description: 'Proceso de verificación y recuperación de cuenta.',
};

export default function VerificationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center bg-background p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
