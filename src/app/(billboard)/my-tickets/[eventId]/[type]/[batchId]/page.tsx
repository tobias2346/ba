"use client";
import QuestionItem from "@/components/shared/question";
import { useMyTicketContext } from "../../context/my-ticketsContext";
import { use } from "react";
import Manage from "./manage";

const mockData = [
  {
    id: 1,
    question: "¿Cómo puedo transferir un ticket?",
    answer:
      "Ingresá en la sección 'Gestionar mis tickets (+)' y seleccioná la opción Transferir.",
  },
  {
    id: 2,
    question: "¿Como asigno un ticket?",
    answer:
      "Ingresá en la sección 'Gestionar mis tickets (+)' y seleccioná la opción asignar o copiar link y compártelo con tu invitado",
  },
  {
    id: 3,
    question: "¿Puedo cancelar un evento?",
    answer:
      "Los eventos no son cancelables, pero podés transferir tu ticket a otra persona o solicitar un reembolso parcial hasta 72hs previas.",
  },
];


export default function EventDetailPage({params} :{  params: Promise<{ type: string }>; }) {

const { type } = use(params);
    
  // ====== MAPS EMBED (key pública + place_id preferido) ======
  const MAPS_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;

  const { event } = useMyTicketContext();
  const query = encodeURIComponent(event?.address.description);
  

  return (
    <section className="flex flex-col md:flex-row-reverse bg-background md:px-[20vh] gap-x-8 py-8 px-4 w-full">
      <div className="flex flex-col gap-4 ">
        <Manage type={type}/>
        <h3 className="text-lg font-headline font-semibold">
          Preguntas frecuentes
        </h3>
        <div className="flex flex-col gap-y-2 w-full md:w-96">
          {mockData.map((data) => (
            <QuestionItem key={data.id} {...data} />
          ))}
        </div>
      </div>
      <article className="flex flex-col gap-4 h-auto mt-2 md:m-0 grow">
        <h6 className="my-2 font-semibold block md:hidden">Descripcion</h6>
        <div className="flex flex-col items-start bg-secondary p-3 rounded-lg h-min">
          <p>{event?.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold font-headline">Lugar</h3>
          <h6 className="text-base font-semibold">
            {event?.address?.description}
          </h6>
          <iframe
            width="100%"
            height="300"
            className=" rounded-lg"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${query}`}
          />
        </div>
      </article>
    </section>
  );
}
