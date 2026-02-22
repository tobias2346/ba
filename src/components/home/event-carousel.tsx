import { EventCard } from "../shared/event-card";

export interface EventCategory {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  flyer: string;
  banner: string;
  address: { description: string, placeId : string }; // Podrías definir una interfaz para la dirección si tiene más campos
  startDate: string; // Podrías usar Date si lo parseás
  endDate: string;   // idem
  onBillboard: boolean;
  onHome: boolean;
  trending: boolean;
  carouselId: string;
  participants: any[]; // si sabés la forma de los participantes podés tiparlo mejor
  state: string; // podrías restringirlo a un union type: "not started" | "in progress" | "finished"
  verified: boolean;
  category: EventCategory;
}

interface EventCarouselProps {
  events: Event[];
  title: string;
}

export function EventCarousel({ events, title }: EventCarouselProps) {
  return (
    <section className="w-full flex flex-col items-start justify-start gap-4 bg-secondary-foreground px-3 md:p-0">
      <h4 className="text-3xl font-semibold">{title}</h4>
      <div className="flex flex-col gap-6 w-full">
        {Array.from({ length: Math.ceil(events.length / 3) }).map((_, rowIndex) => {
          const row = events.slice(rowIndex * 4, rowIndex * 4 + 4);
          return (
            <div
              key={rowIndex}
              className=" flex md:grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-x-auto overflow-y-hidden md:overflow-hidden w-full hide-scrollbar"
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
    </section>
  );
}
