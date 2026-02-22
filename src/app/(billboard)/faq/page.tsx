
import QuestionItem from "@/components/shared/question";

const faqData = [
  {
    id: 1,
    question: "¿Qué es Básquet ID?",
    answer: "Básquet ID es la ticketera oficial de la Asociación de Clubes (AdC) y de la Confederación Argentina de Básquet (CAB). Con tu cuenta vas a tener un QR personal único y un alias que te identifican como hincha. Desde la plataforma podés comprar entradas, recibir asignaciones y acceder a beneficios en todos los torneos organizados por la AdC y la CAB.",
  },
  {
    id: 2,
    question: "¿Cómo funciona mi QR?",
    answer: "Cuando te registrás, Básquet ID te asigna un QR que sera tu identificación personal, única e intranferible para todos los eventos, a su vez, el mismo es dinámico para garantizar la mayor seguridad ( con lo cual no sirven las capturas de pantalla) . Como mencionamos este QR, es tu pase para todos los partidos a los que tengas acceso. Las entradas no se envían por mail: quedan asignadas automáticamente a tu cuenta.",
  },
  {
    id: 3,
    question: "¿Qué es el alias y para qué sirve?",
    answer: "El alias es tu nombre de usuario personalizable en Básquet ID. Con él podés:\n• Recibir entradas si alguien te las asigna.\n• Transferir tus entradas a otra persona usando su alias.\n• Ser agregado a listas especiales (invitados, prensa, cortesías, etc.).",
  },
  {
    id: 4,
    question: "¿Cómo compro mis entradas?",
    answer: "1. Registrate o ingresá en Básquet ID.\n2. Elegí el partido desde la cartelera o buscá tu partido en la sección Clubes.\n3. Seleccioná el sector del estadio en el plano interactivo o elegí directamente un ticket/combo. Podés comprar la cantidad máxima permitida por el organizador o hasta agotar stock.\n4. Pagá con tarjeta de crédito, débito o con dinero en cuenta de Mercado Pago.",
  },
  {
    id: 5,
    question: "¿Cómo ingreso al estadio?",
    answer: "Mostrá tu QR personal en el molinete o al personal de control. No necesitás imprimir nada ni descargar archivos adicionales.",
  },
  {
    id: 10,
    question: "¿Cómo asigno o transfiero mis tickets?",
    answer: "Para asignar o tranferir tus tickets, realiza los siguientes pasos:\n\n1) Logueate con tu usuario en Básquet ID.\n2) Ingresá a Mis Tickets.\n3) Seleccioná el partido correspondiente.\n4) Elegí el tipo de ticket.\n5) Selecciona un ticket Disponible y dale al boton de gestión (+).\n6) Clickea en Asignar o Transferir, e ingresá el alias del destinatario.\n7) Confirma y Listo. El ticket quedará vinculado al alias que seleccionaste y la persona podrá verlo en su cuenta.\n\nRequisitos previos:\nEl destinatario debe estar registrado en Básquet ID antes de recibir el ticket.",
  },
  {
    id: 6,
    question: "¿Cuál es la diferencia entre asignar y transferir un ticket?",
    answer: "En Básquet ID hay dos formas de gestionar una entrada a otra persona: asignar y transferir, y funcionan distinto:\n\nAsignar un ticket:\n• Solo aplica cuando el comprador (Owner) compra más de una entrada.\n• Podés asignar una entrada a otro hincha usando su alias, pero seguís siendo el dueño del ticket.\n• Esto significa que desde tu cuenta seguís viendo y gestionando ese ticket, y podés modificar los datos de tu invitado hasta que ingrese al estadio y se utilice el ticket.\n\nTransferir un ticket:\n• Cuando transferís un ticket, perdés el control sobre él.\n• El nuevo dueño pasa a ser quien recibió la entrada a través de su alias.\n• El owner inicial ya no puede gestionarlo ni modificarlo de ninguna manera.\n\nEn resumen:\n• Asignar = cedes temporalmente, seguís siendo dueño.\n• Transferir = cedés definitivamente, el otro es ahora el owner.",
  },
  {
    id: 7,
    question: "¿Qué pasa si un partido se suspende o cambia de fecha?",
    answer: "La entrada queda activa en tu cuenta y será válida para la nueva fecha. Si no podés asistir, se reintegrará el monto según la política de reembolsos establecida por Basquet iD.",
  },
  {
    id: 8,
    question: "¿Los menores pagan entrada?",
    answer: "Depende de la política de cada club y estadio. Al comprar, la plataforma te mostrará las categorías habilitadas (menores, jubilados, generales, etc.).",
  },
  {
    id: 9,
    question: "¿Qué es la sección Clubes?",
    answer: "La sección Clubes fue creada para que puedas acceder de manera ordenada a todos los equipos, según la liga a la que pertenecen. Cada club tiene su propio espacio donde puede alojar eventos fuera del calendario oficial, como partidos de infantiles, torneos amistosos, cenas, agasajos o actividades sociales. Como usuario, desde ahí vas a poder conocer y adquirir entradas para todas las actividades que organice tu club.",
  },
];

export default function FAQPage() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 font-body">
      <div className="max-w-4xl mx-auto text-light/90">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 font-headline">
          Preguntas Frecuentes
        </h1>
        <div className="space-y-4">
          {faqData.map(item => <QuestionItem key={item.id} question={item.question} answer={item.answer} />)}
        </div>
      </div>
    </section>
  );
}
