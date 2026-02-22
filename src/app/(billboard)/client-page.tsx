// app/home-client.tsx
'use client';
import { HeroSlider } from "@/components/home/hero-slider";
import Marketing from "@/components/home/marketing";
import Content from "./content";

export default function ClientPage({ data }: { data: any }) {
  return (
    <main className="flex min-h-screen flex-col pb-4">
      {data?.trending && <HeroSlider data={data.trending} />}
      <Content data={data} />
      <Marketing />
    </main>
  );
}
