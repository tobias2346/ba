import TicketsSection from './tickets-section';
import NavTags from '@/components/events/nav-tags';
import EventCart from '@/components/events/event-cart';
import GoBack from './go-back';

export default function CheckoutPage() {

  return (
    <section className='flex justify-center items-center w-full my-8'>
      <article className='w-full md:w-5/6 xl:w-4/5 2xl:w-3/4 flex flex-col items-center md:items-start md:flex-row gap-4'>
        <div className='w-full md:w-3/5 flex flex-col items-center'>
          <NavTags
            selectedIndex={0}
            tags={['Seleccionar ticket', 'Finalizar pago']}
          />
          <TicketsSection />
          <div className='w-full hidden md:flex justify-end px-6 md:p-0'>
            <GoBack />
          </div>
        </div>
        <EventCart />
      </article>
    </section>
  );
}
