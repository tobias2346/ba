"use client";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi, // 👈 Importa el tipo si lo necesitas
} from "@/components/ui/carousel";
import Link from "next/link";
import CommonButton from "../common/common-button";

export function HeroSlider({ data }) {
  const [mounted, setMounted] = React.useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // escuchar cambios de slide
  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setSelectedIndex(api.selectedScrollSnap());

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (!mounted) return null;
  console.log(data)
  return (
    <div className="relative w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi} // 👈 capturamos la API de Embla
      >
        <CarouselContent>
          {data.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-auto w-full flex flex-col md:flex-row bg-dark ">
                <div className="w-full md:w-1/3 h-10 mt-4 md:h-auto flex flex-col justify-center items-center md:items-start lg:pl-[5vw] 2xl:pl-[10vw] gap-y-2 md:gap-y-4">
                  <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold drop-shadow-lg font-headline">
                    {slide.name}
                  </h2>
                  <div className="hidden md:flex items-center gap-x-2">
                    <Image
                      width={25}
                      height={25}
                      src="/icons/calendar.svg"
                      alt="Calendario"
                    />
                    <p className=" max-w-2xl text-base text-neutral-200 drop-shadow-sm">
                      {slide.startDate}
                    </p>
                  </div>
                  <Link
                    href={`/events/${slide.id}`}
                    className="absolute left-1/2 bottom-12 z-50 -translate-x-1/2 md:-translate-x-0 md:left-0 md:bottom-0 md:relative inline-block"
                  >
                    <CommonButton text="Comprar entradas" type="primary" />
                  </Link>
                </div>
                <Image
                  src={slide.banner}
                  alt={slide.name}
                  width={900}
                  height={500}
                  priority
                  className="h-auto max-h-[75vh] w-full md:w-2/3 mask-fade"
                  data-ai-hint={slide.dataAiHint}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Bullets */}
      <div className="absolute bottom-4 right-0 left-0 w-full flex justify-center ">
        <div className=" px-4 py-1 rounded-lg backdrop-blur-2xl flex gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-4 w-4 rounded-full transition-colors ${i === selectedIndex ? "bg-primary" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
