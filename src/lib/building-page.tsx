'use client'
import { Logo } from '@/components/icons/logo';
import Support from '@/components/shared/support';
import { Cog, Hammer } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { useEffect, useState } from "react";

function AnimatedGears() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse-glow" />
      <div className="absolute animate-spin-slow">
        <Hammer className=" w-32 h-32 text-primary" />
      </div>
      {/* <div className="absolute -top-2 -right-2 animate-spin-reverse">
        <Cog className="w-20 h-20 text-primary/60" strokeWidth={1.5} />
      </div>
      <div className="absolute -bottom-1 -left-4 animate-spin-slow" style={{ animationDuration: "5s" }}>
        <Cog className="w-14 h-14 text-primary/40" strokeWidth={1.5} />
      </div> */}
      <div className="absolute w-4 h-4 rounded-full bg-primary/80 z-10" />
    </div>
  );
}


export default function BuildingPage() {
  return (
    <main className='flex flex-col h-screen justify-between items-center '>
      <header className="top-0 z-50 w-full min-h-16 bg-dark flex items-center justify-between px-4 md:px-[10vw] border-b border-secondary ">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo alt="Header Logo" width={120} height={120} />
          </Link>
        </div>
        <div className="flex item-center w-auto gap-x-4">
          <Support />
        </div>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center px-6 my-16 relative ">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-10 animate-float">
          <AnimatedGears />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 mt-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
              Tareas de mantenimiento
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed text-balance">
              Estamos trabajando para traerte la mejor experiencia. Volvemos pronto.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-secondary/8  0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-sm text-muted-foreground">
              Trabajando activamente en mejoras
            </span>
          </div>
        </div>
      </section>
      <footer className="flex flex-col items-start bg-dark text-white gap-y-6 p-6 w-full md:px-[20vh]">
        <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
          <div>
            <Logo alt="Footer Logo" width={140} height={140} />
          </div>

        </div>
        <div className="flex flex-col md:flex-row justify-start gap-4 items-start md:items-center w-full">
          <Link href='/privacy' className="text-sm underline " > Políticas de privacidad </Link>
          <Link href='/terms' className="text-sm underline " > Términos y condiciones </Link>
          <Link href='/faq' className="text-sm underline " > Preguntas frecuentes </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center w-full">
          <div className="flex flex-col md:flex-row justify-start gap-4 items-start md:items-center ">
            <p className=" text-xs text-[#D6D6D6]">Copyright© 2025. Todos los derechos reservados.</p>
            <p className="text-xs text-[#D6D6D6]">La venta de entradas esta verificada por los entes deportivos de Argentina.</p>
          </div>
          <div className="flex items-start md:items-center gap-4">
            <Link href='https://www.instagram.com/laligabasquet' target='_blank'>
              <Image src='/logos/instagram.svg' width={20} height={20} alt="Instagram" />
            </Link>
            <Link href='https://www.facebook.com/lnboficial' target='_blank'>
              <Image src='/logos/facebook.svg' width={20} height={20} alt="facebook" />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
