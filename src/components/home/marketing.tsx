'use client';
import { useStores } from '@/contexts/stores-context';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const Marketing = () => {
  const [bannerUrl, setBannerUrl] = useState(null);
  const { getBrandBannerUrl, loading } = useStores();

  useEffect(() => {
    const fetchBanner = async () => {
      const url = await getBrandBannerUrl();
      setBannerUrl(url);
    }
    fetchBanner();
  }, [getBrandBannerUrl])

  if (loading) {
    return (
      <div className="w-11/12 2xl:w-full container mx-auto h-44 bg-secondary rounded-xl hidden md:flex items-center justify-center animate-pulse my-8">
      </div>
    );
  }

  if (!bannerUrl) {
    return null; // No renderizar nada si no hay banner
  }

  return (
    <div className="w-11/12 2xl:w-full container mx-auto h-44 bg-secondary rounded-xl hidden md:flex items-center justify-center my-8 relative overflow-hidden">
      <Image src={bannerUrl} alt="Banner Publicitario" fill priority/>
    </div>
  )
}

export default Marketing
