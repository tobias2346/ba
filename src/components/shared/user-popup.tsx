"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useUser } from "@/contexts/user-context";
import { Calendar, Computer, Image as ImageIcon, LogOut, User, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BannerUploadModal } from "./banner-upload-modal";

export function UserPopup() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const hasDashboardAccess = useMemo(() => {
    if (!user?.role) return false;
    const allowedRoles = ['super-admin', 'admin', 'manager', 'rrpp-leader', 'data-analyst'];
    return allowedRoles.includes(user.role as string);
  }, [user]);

  const hasBannerAccess = useMemo(() => {
    if (!user?.role) return false;
    return ['super-admin', 'admin'].includes(user.role as string);
  }, [user]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="rounded-full">
            <Avatar className="h-11 w-11">
              <AvatarImage
                src={user?.photo as string}
                alt={(user?.name as string) || "User"}
              />
              <AvatarFallback>
                <UserCircle className="h-11 w-11 text-primary" />
              </AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-52 bg-slate-800 rounded-xl border-none flex flex-col p-4 gap-y-4 font-headline">
          <Link
            href="/my-account"
            className="w-full hover:text-primary flex items-center justify-start gap-x-4"
          >
            <User  className="w-5 h-5"/>
            <span>Mi cuenta</span>
          </Link>
          <Link
            href="/my-tickets"
            className="w-full hover:text-primary flex items-center justify-start gap-x-4"
          >
            <Calendar className="w-5 h-5"/>
            <span>Mis tickets</span>
          </Link>
          {hasDashboardAccess && (
            <Link
              href="/dashboard"
              className="w-full hover:text-primary flex items-center justify-start gap-x-4"
            >
              <Computer className="w-5 h-5" />
              <span>DashBoard</span>
            </Link>
          )}
          {hasBannerAccess && (
            <button
              className="w-full hover:text-primary flex items-center justify-start gap-x-4"
              onClick={() => setIsBannerModalOpen(true)}
            >
              <ImageIcon className="w-5 h-5" />
              <span>Banners</span>
            </button>
          )}

          <div className="w-full h-px bg-gray-800"></div>
          <button
            className="w-full hover:text-primary flex items-center justify-start gap-x-4"
            onClick={() => { router.push('/'), logout()}}
          >
            <LogOut  className="w-5 h-5"/>
            <span>Cerrar sesión</span>
          </button>
        </PopoverContent>
      </Popover>
      {hasBannerAccess && <BannerUploadModal isOpen={isBannerModalOpen} onClose={() => setIsBannerModalOpen(false)} />}
    </>
  );
}
