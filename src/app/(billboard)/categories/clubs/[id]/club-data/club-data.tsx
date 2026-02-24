import Image from 'next/image';
import { ClubDataLoading } from './club-data-loading';

export default function ClubData({ club }: { club: any }) {

  if (!club)
    return <ClubDataLoading />


  return (
    <div className="w-full flex justify-start items-center gap-8 h-40 p-2 bg-white shadow-lg rounded-xl">
      <Image src={club.logo} alt="Imagen del club" width={100} height={100} />
      <h4 className="font-headline text-3xl font-semibold w-3/4 truncate text-ellipsis ">{club.name}</h4>
    </div>
  )
}
