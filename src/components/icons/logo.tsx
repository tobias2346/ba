import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  alt: string,
  height : number,
  width : number
}

export function Logo({ alt, height, width }: LogoProps) {
  return (
    <Image
    height={height}
    width={width}
    src='/logos/logo.svg'
    priority
    alt="Logo"
    className=" w-auto h-auto"
    />
  );
}
