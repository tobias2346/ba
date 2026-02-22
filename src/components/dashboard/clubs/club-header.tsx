
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail, Shield } from 'lucide-react';

interface ClubHeaderProps {
  clubName: string;
  clubLogo: string | null;
  clubEmail: string;
}

export function ClubHeader({ clubName, clubLogo, clubEmail }: ClubHeaderProps) {
  return (
    <div>
      <Link href="/dashboard/clubs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver a Clubes
      </Link>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center">
              {clubLogo ? (
                <Image src={clubLogo} alt={clubName} width={64} height={64} className="object-contain"/>
              ) : (
                <Shield className="h-12 w-12 text-muted-foreground" />
              )}
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">{clubName}</h1>
             <div className="flex items-center gap-2 mt-1">
                 <Mail className="h-4 w-4 text-muted-foreground"/>
                 <span className="text-sm text-muted-foreground">{clubEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
