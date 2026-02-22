import NavTags from '@/components/events/nav-tags';
import PaymentSection from './payment-section';

export default function PaymentPage() {

  return (
    <section className='flex justify-center items-center w-full my-8'>
      <article className='lg:w-3/4 xl:w-3/5 2xl:w-1/2 flex flex-col gap-4'>
        <NavTags
          selectedIndex={1}
          tags={['Seleccionar ticket', 'Finalizar pago']}
        />
        <PaymentSection />
      </article>
    </section>
  );
}
