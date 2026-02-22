'use client'
import { useUser } from '@/contexts/user-context';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CommonButton from '../common/common-button';
import QrPopup from '../shared/qr-popup';
import { UserPopup } from '../shared/user-popup';

const AuthHandler = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const redirectParam = (() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('redirect');
    const qs = sp.toString();
    const hash =
      typeof window !== 'undefined' ? window.location.hash || '' : '';
    return `${pathname}${qs ? `?${qs}` : ''}${hash}`;
  })();

  const { logged, user, loading } = useUser();

  const handleClick = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('postLoginRedirect', redirectParam);
      }
    } catch {}
    router.push(`/login`);
  };

  return (
    <>
      {
        loading ?
          <div className="w-9 h-9 border-4 border-t-4 border-t-transparent border-primary rounded-full animate-spin"></div>
          : logged ?
            <>
              <QrPopup logged={logged} user={user} />
              <UserPopup />
            </>
            :
            <CommonButton text="Ingresar" type="primary" action={handleClick} />
      }
    </>
  )
}

export default AuthHandler