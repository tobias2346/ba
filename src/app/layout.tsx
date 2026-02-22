import "./globals.css";
import { UserProvider } from "@/contexts/user-context";
import { UIProvider } from "@/contexts/ui-context";
import { QrModal } from "@/components/shared/qr-modal";
import { VerifyEmailModal } from "@/components/auth/verify-email-modal";
import { Toaster } from "sonner";
import { Nunito, Inter } from "next/font/google";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { Metadata } from "next";
import BuildingPage from "@/lib/building-page";

//  Configure PT Sans font
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-nunito",
});

//  Configure Playfair Display font
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Basquet ID",
  description: "Vivi lo mejor del Basquet Argentino",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" translate="no" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-body antialiased">
        {/* Descomentar para mantenimiento */}
        {/* <BuildingPage/> */}
        {/* Comentar para mantenimiento */}

        <UIProvider>
          <UserProvider>
            <DashboardProvider>
              {children}
              <Toaster richColors />
              <VerifyEmailModal />
              <QrModal />
            </DashboardProvider>
          </UserProvider>
        </UIProvider>
      </body>
    </html>
  );
}
