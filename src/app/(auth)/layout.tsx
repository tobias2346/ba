
import { Logo } from '@/components/icons/logo';
import { Footer } from '@/components/shared/footer';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Basquet ID',
  description: 'La nueva generación de venta de tickets',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center justify-center bg-background gap-y-8">
      <header className="w-full h-20 flex items-center px-8 bg-dark/80">
        <Link href="/">
          <Logo width={150} height={150} alt="Login logo" />
        </Link>
      </header>
      {children}
      <Footer />
    </main>
  );
}
