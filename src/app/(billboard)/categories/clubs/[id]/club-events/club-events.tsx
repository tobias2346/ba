import { EventCard } from '@/components/shared/event-card';
import Image from 'next/image';
import Link from 'next/link';

export default function ClubEvents({ data }) {

  return (
    <div className="w-full h-auto flex justify-center md:justify-start items-center flex-wrap gap-y-4 mb-8">
      {
        data.length === 0 ?
          <div className='flex flex-col items-center gap-y-2'>
            <Image width={100} height={100} alt="Calendar" src='/icons/big-calendar.svg' />
            <p className="text-gray-500 text-lg">El club no tiene eventos</p>
            <Link href={'/'} className='px-4 py-2 font-medium rounded-lg shadow transition-colors duration-200 text-sm xl:text-base bg-primary text-black hover:bg-primary/80' >Ver eventos</Link>
          </div>
          : <div className="flex flex-col gap-6 w-full">
            {Array.from({ length: Math.ceil(data.length / 3) }).map((_, rowIndex) => {
              const row = data.slice(rowIndex * 4, rowIndex * 4 + 4);
              return (
                <div
                  key={rowIndex}
                  className=" flex md:grid md:grid-cols-2 2xl:grid-cols-3 gap-4 overflow-x-auto overflow-y-hidden md:overflow-hidden w-full hide-scrollbar"
                >
                  {row.map((event) => (
                    <div key={event.id} className="flex-shrink-0">
                      <EventCard href={`/events/${event.id}`} {...event} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
      }
    </div>
  )
}
