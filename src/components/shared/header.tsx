"use client";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { usePathname } from "next/navigation";
import AuthHandler from "../auth/auth-handler";
import { Suspense, useState } from "react";
import Support from "./support";
import { useUser } from "@/contexts/user-context";

export function Header() {
  const pathname = usePathname();
  const { logged, user } = useUser();

  const baseLinks = [
    { href: "/", label: "Eventos", includes: false },
    { href: "/categories", label: "Clubes", includes: true },
  ];

  let allLinks = logged
    ? [
      ...baseLinks,
      { href: "/my-tickets", label: "Mis Tickets", includes: true },
    ]
    : baseLinks;

  if (user?.role?.includes("rrpp")) {
    allLinks.push({ href: "/rrpp", label: "RRPP", includes: false });
  }
  return (
    <>
      <header className="top-0 z-50 w-full h-16 bg-dark flex items-center justify-between px-4 md:px-[10vw] border-b border-secondary ">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo alt="Header Logo" width={120} height={120} />
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {allLinks.map((link) => {
              let isActive = false;
              if (link.includes) {
                isActive = pathname.includes(link.href);
              } else {
                isActive = pathname === link.href;
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${isActive
                    ? "text-primary"
                    : "text-primary/70 hover:text-primary"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex item-center w-auto gap-x-4">
          <Support />
          <Suspense fallback={<></>}>
            <AuthHandler />
          </Suspense>
        </div>
      </header>
      <nav className="flex md:hidden items-center justify-start pl-4 space-x-4 text-sm h-14 border-b border-secondary font-headline">
        {allLinks.map((link) => {
          let isActive = false;
          if (link.includes) {
            isActive = pathname.includes(link.href);
          } else {
            isActive = pathname === link.href;
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2 h-full flex justify-center items-center transition-all duration-300
              ${isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-200 hover:text-primary"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
