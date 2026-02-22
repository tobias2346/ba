import { EventCard } from "../shared/event-card";
import { Event } from "./event-carousel";

interface EventCarouselProps {
  events: Event[];
  title: string;
}

export function MainEventCarousel({ events, title }: EventCarouselProps) {
  console.log(events)
  return (
    <section className="w-full flex flex-col items-start justify-start gap-4 bg-secondary-foreground px-3 md:p-0">
      <h4 className="text-2xl xl:text-3xl font-semibold">{title}</h4>
      <div className="flex flex-col gap-6 w-full">
        <div
          className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4 w-full"
        >
          {events.map((event) => (
            <div key={event.id} className="flex-shrink-0">
              <EventCard href={`/events/${event.id}`} extend {...event} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-y-4 md:hidden">
          {Array.from({ length: Math.ceil(events.length / 4) }).map((_, rowIndex) => {
            const row = events.slice(rowIndex * 4, rowIndex * 4 + 4)
            return (
              <div
                key={rowIndex}
                className="flex gap-4 overflow-x-auto overflow-y-hidden w-full hide-scrollbar"
              >
                {row.map((event) => (
                  <div key={event.id}>
                    <EventCard href={`/events/${event.id}`} extend {...event} />
                  </div>
                ))}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  );
}
