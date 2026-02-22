import { EventCardLoading } from '@/components/shared/event-card-loading';
import React from 'react';

const Loading = () => {
  return (
    <section className="flex-1 flex flex-col items-start p-8 md:p-20 gap-y-8 my-8">
      <h4 className="text-3xl">Mis tickets</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">

        {
          [0, 1, 2, 3].map(i => <EventCardLoading key={i} />)
        }
      </div>
    </section>
  );
};

export default Loading;