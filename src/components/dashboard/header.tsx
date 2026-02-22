'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import {
  Users,
  Shield,
  DollarSign,
  GalleryHorizontal,
  LogOut,
  UserCircle,
  Landmark,
  BarChart,
  Settings,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Logo } from '../icons/logo';
import { PartidosIcon } from '../icons/partidos-icon';
import { AdminsIcon } from '../icons/admins-icon';
import { RrppIcon } from '../icons/rrpp-icon';
import { MerchIcon } from '../icons/merch-icon';

import { useUser } from '@/contexts/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const allNavItems = [
  { href: "/dashboard", icon: BarChart, label: "Estadísticas", roles: ['super-admin', 'admin', 'manager', 'data-analyst'] },
  { href: "/dashboard/clubs", icon: Shield, label: "Clubes", roles: ['super-admin', 'admin', 'manager'] },
  { href: "/dashboard/events", icon: PartidosIcon, label: "Partidos", roles: ['super-admin', 'admin', 'manager'] },
  { href: "/dashboard/stadiums", icon: Landmark, label: "Estadios", roles: ['super-admin', 'admin', 'manager'] },
  { href: "/dashboard/merch", icon: MerchIcon, label: "Merchandising", roles: ['super-admin', 'admin', 'manager'] },
  { href: "/dashboard/transactions", icon: DollarSign, label: "Transacciones", roles: ['super-admin', 'admin', 'manager'] },
  { href: "/dashboard/carousels", icon: GalleryHorizontal, label: "Carruseles", roles: ['super-admin', 'admin'] },
  { href: "/dashboard/users", icon: Users, label: "Usuarios", roles: ['super-admin', 'admin'] },
  { href: "/dashboard/admins", icon: AdminsIcon, label: "Admins", roles: ['super-admin', 'admin'] },
  { href: "/dashboard/rrpp", icon: RrppIcon, label: "RRPP", roles: ['super-admin', 'admin', 'manager', 'rrpp-leader'] },
];

export function DashboardHeader() {
  const { user, logout } = useUser();
  const pathname = usePathname();

  const navItems = allNavItems.filter(
    (item) => user?.role && item.roles.includes(user.role as string)
  );

  const isActive = (href: string) => pathname === href

  const formatRole = (role?: string) =>
    role
      ? role
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      : '';

  return (
    <header className="sticky top-0 z-40 bg-dark">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row h-auto md:items-center gap-4 py-4 md:py-0 px-4 md:px-6">
        <Link href="/dashboard">
          <Logo alt="Logo Liga" width={120} height={120} />
        </Link>
        <div className='flex justify-between w-full'>
          <div className="flex items-center gap-4">
            <div className="text-base font-medium flex gap-1">
              <h4 className='text-base'>{user?.name}</h4>
              <h4 className='text-base'>{user?.lastName}</h4>
            </div>

            <div className="text-sm font-medium text-purple-500 bg-purple-500/10 rounded-full flex items-center gap-2 px-5 py-1.5">
              <Image src="/icons/segure.svg" alt="segure" width={14} height={14} />
              <h4>{formatRole(user?.role)}</h4>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 h-auto">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user?.photo ?? undefined} alt={user?.name ?? 'User'} />
                    <AvatarFallback>
                      <UserCircle className="h-9 w-9 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60 bg-slate-800 border-none">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium leading-none">
                      {user?.name} {user?.lastName}
                    </p>
                    <p className="text-sm leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/my-account">
                    <Settings className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ir a Cartelera
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full  px-4 py-2 flex items-center gap-2 flex-wrap">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-x-2
              px-4 py-2 rounded-lg
              text-xs font-medium font-headline
              transition-all duration-200
              ${isActive(item.href)
                ? "bg-primary/40 text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-primary/60 hover:text-primary-foreground"
              }
            `}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}
