import HeadText from '@/components/common/common-head-text'
import Image from 'next/image'
import { useEventContext } from './context/eventContext'

const EventHeaderBillboard = () => {

  const { event } = useEventContext()

  const getDates = () => {
    const [date, time] = event!.startDate.split(" ");
    return { date, time }
  }

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-start w-full bg-dark md:bg-gradient-to-t from-dark via-dark to-primary/30  h-auto p-5 md:py-8 md:px-[20vh] gap-8'>
      <article className="h-52 md:h-56 relative flex w-full md:w-96 ">
        {
          event?.flyer ?
            <Image
              src={event.flyer}
              alt='Logo'
              width={300}
              height={150}
              className='w-full rounded-lg'
              quality={100}
              priority
            />
            :
            <div className='w-full h-56 bg-slate-600 rounded-lg animate-pulse'></div>
        }
      </article>
      <div className="flex flex-col gap-y-3 ">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">
          {event?.name || '...'}
        </h1>
        <article className="flex items-center gap-x-8">
          <HeadText head="Fecha" description={event ? getDates().date : '...'} />
          <HeadText head="Horario" description={event ? getDates().time : '...'} />
        </article>
        <HeadText head="Dirección" description={event ? event.address.description : '...'} />
      </div>
    </div>
  )
}

export default EventHeaderBillboard
