import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { StoresProvider } from "@/contexts/stores-context";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StoresProvider>
      <Header />
      {children}
      <Footer />
    </StoresProvider>
  );
}
