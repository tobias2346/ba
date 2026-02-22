import React from 'react'

const page = () => {
  return (
    // <section className='flex flex-col w-full items-center gap-y-8 bg-slate-900 max-w-2xl'>
    //   <div className='w-full flex items-center justify-start border-b border-gray-800 h-16 px-8'>
    //     <img className='w-20 h-10' src='url de la imagen' />
    //   </div>
    //   <h1 className='text-4xl'>Titulo de la seccion</h1>
    //   <p className='text-base '>Parrafo descripcion</p>
    //   <button className='px-5 py-3 bg-cyan-500 text-white rounded-xl font-semibold' type='button'>texto del botton</button>
    //   <div className='w-full flex flex-col gap-y-4 items-start justify-start border-b border-gray-800 h-auto p-4'>
    //     <p className='text-sm font-medium'>Si tiene alguna pregunta, envíenos un mensaje a <span className='text-cyan-500'>contacto@basquetid.com.</span>  Nos encantaría saber de ti. - Equipo Basquet ID</p>
    //     <p className='text-sm font-medium'>- Equipo Basquet ID</p>
    //   </div>
    //   <div className='w-full flex flex-col gap-y-4 items-start justify-start border-b border-gray-800 h-auto p-4'>
    //     <p className='text-sm font-medium'>Si estás recibiendo este correo electrónico es porque se suscribió para recibir correos electrónicos de marketing. Si prefiere no recibir estos correos electrónicos, <span className='text-cyan-500'>cancele la suscripción.</span></p>
    //   </div>
    //   <div className='flex w-full justify-between items-center'>
    //     <div className='flex gap-x-2'>
    //       <img className='w-12 h-10' src='url de youtube' />
    //       <img className='w-12 h-10' src='url de facebook' />
    //       <img className='w-12 h-10' src='url de twiter' />
    //       <img className='w-12 h-10' src='url de linkedin' />
    //     </div>
    //     <div className='flex flex-col gap-y-2 items-end text-sm font-semibold'>
    //       <p>© 2023 Basquet ID S.A</p>
    //       <p>direccion</p>
    //     </div>
    //   </div>
    // </section>

    // <section className='flex flex-col w-full items-center gap-y-8 bg-slate-900 max-w-2xl'>
    //   <div className='w-full flex items-center justify-start border-b border-gray-800 h-16 px-8'>
    //     <img className='w-20 h-10' src='url de la imagen' />
    //   </div>
    //   <img className='w-28 h-28' src='url de la de compra exitosa' />
    //   <section className="flex flex-col justify-center items-center ">
    //     <h3 className="my-2 text-2xl font-semibold">Título del Evento</h3>

    //     <h5 className="my-2 text-center font-semibold text-sm text-gray-400">
    //       Subtítulo o descripción breve del evento
    //     </h5>
    //     <div className="w-80 bg-slate-800 rounded-lg shadow h-28 flex items-center justify-start gap-x-4 px-2 mb-2">
    //       <img className='w-28 h-24' src='url de la imagen del evento' />
    //       <div className='flex flex-col w-40'>
    //         <h5 className='text-sm font-medium text-gray-300'>LA LIGA</h5>
    //         <h3 className='w-full truncate text-ellipsis font-semibold text-white text-xl'>Boca vs San Lorenzo</h3>
    //       </div>
    //     </div>
    //     {/* Badge fijo */}
    //     <div className="w-80 bg-slate-800 rounded-lg shadow h-14 flex items-center justify-between px-4">
    //       <img className='w-20 h-10' src='url de la imagen' />
    //       <div
    //         className="flex justify-between items-center px-4 py-1 shadow text-black rounded-lg font-semibold bg-green-500"
    //       >
    //         estado
    //       </div>
    //     </div>

    //     {/* Detalle de entradas */}
    //     <div className="w-80 bg-slate-800 rounded-lg shadow flex flex-col justify-start p-4 mb-4 font-headline gap-2">
    //       <h4 className="font-semibold ">Nombre del Evento</h4>

    //       <div className="flex flex-col gap-2">
    //         <div className="flex justify-between items-center w-full">
    //           <h6 className="text-medium">Entrada General x2</h6>
    //           <h6 className="text-medium">$4000</h6>
    //         </div>
    //       </div>

    //       <span className="h-px bg-gray-900 w-full"></span>

    //       {/* Info fija */}
    //       <div >
    //         <h3 className="text-sm text-primary">Fecha</h3>
    //         <span className="text-sm overflow-hidden text-ellipsis">xx</span>
    //       </div>
    //       <div >
    //         <h3 className="text-sm text-primary">Horario</h3>
    //         <span className="text-sm overflow-hidden text-ellipsis">xx</span>
    //       </div>   <div >
    //         <h3 className="text-sm text-primary">Lugar</h3>
    //         <span className="text-sm overflow-hidden text-ellipsis">xx</span>
    //       </div>
    //     </div>
    //     <a href="/" className="px-5 py-3 bg-cyan-500 text-black rounded-xl font-semibold">
    //       Ir a Mis tickets
    //     </a>

    //   </section>
    //   <div className='w-full flex flex-col gap-y-4 items-start justify-start border-b border-gray-800 h-auto p-4'>
    //     <p className='text-sm font-medium'>Si tiene alguna pregunta, envíenos un mensaje a <span className='text-cyan-500'>contacto@basquetid.com.</span>  Nos encantaría saber de ti. - Equipo Basquet ID</p>
    //     <p className='text-sm font-medium'>- Equipo Basquet ID</p>
    //   </div>
    //   <div className='w-full flex flex-col gap-y-4 items-start justify-start border-b border-gray-800 h-auto p-4'>
    //     <p className='text-sm font-medium'>Si estás recibiendo este correo electrónico es porque se suscribió para recibir correos electrónicos de marketing. Si prefiere no recibir estos correos electrónicos, <span className='text-cyan-500'>cancele la suscripción.</span></p>
    //   </div>
    //   <div className='flex w-full justify-between items-center'>
    //     <div className='flex gap-x-2'>
    //       <img className='w-12 h-10' src='url de youtube' />
    //       <img className='w-12 h-10' src='url de facebook' />
    //       <img className='w-12 h-10' src='url de twiter' />
    //       <img className='w-12 h-10' src='url de linkedin' />
    //     </div>
    //     <div className='flex flex-col gap-y-2 items-end text-sm font-semibold'>
    //       <p>© 2023 Basquet ID S.A</p>
    //       <p>direccion</p>
    //     </div>
    //   </div>
    // </section>
    // <section className='flex flex-col w-full items-center gap-y-8 bg-slate-900 max-w-2xl'>
    //   <div className='w-full flex items-center justify-start border-b border-gray-800 h-16 px-8'>
    //     <img className='w-20 h-10' src='url de la imagen' />
    //   </div>
    //   <img className='w-28 h-28' src='url de la de compra exitosa' />
    //   <section className="flex flex-col justify-center items-center ">
    //     <h3 className="my-2 text-2xl font-semibold">Título del Evento</h3>

    //     <h5 className="my-2 text-center font-semibold text-sm text-gray-400">
    //       Subtítulo o descripción breve del evento
    //     </h5>
    //     <div className="w-96 bg-slate-800 rounded-lg shadow h-48 flex items-start justify-start gap-4 p-4 mb-2">
    //       <img className='w-28 h-24' src='url de la imagen del evento' />
    //       <div className='flex flex-col w-60 gap-1'>
    //         <h5 className='text-sm font-medium text-gray-300'>LA LIGA</h5>
    //         <h3 className='w-full truncate text-ellipsis font-semibold text-white text-xl'>Boca vs San Lorenzo</h3>
    //         <div className='flex flex-wrap gap-2'>
    //           <div className='w-28'>
    //             <h3 className="text-sm text-primary">Lugar</h3>
    //             <p className="text-sm w-full truncate text-ellipsis">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente sequi placeat cumque veniam error explicabo exercitationem! Quidem sint, necessitatibus earum porro nam, id laboriosam aut nemo quasi, maiores rem iure.</p>
    //           </div>
    //           <div className='w-28'>
    //             <h3 className="text-sm text-primary">Lugar</h3>
    //             <p className="text-sm w-full truncate text-ellipsis">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente sequi placeat cumque veniam error explicabo exercitationem! Quidem sint, necessitatibus earum porro nam, id laboriosam aut nemo quasi, maiores rem iure.</p>
    //           </div>
    //           <div className='w-full'>
    //             <h3 className="text-sm text-primary">Lugar</h3>
    //             <p className="text-sm overflow-hidden w-full truncate text-ellipsis">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente sequi placeat cumque veniam error explicabo exercitationem! Quidem sint, necessitatibus earum porro nam, id laboriosam aut nemo quasi, maiores rem iure.</p>
    //           </div>
    //         </div>

    //       </div>
    //     </div>
    //     <img className='w-32 h-32 mt-8' src='qr code' />


    //   </section>
    //   <div className='w-full flex flex-col gap-y-4 items-start justify-start border-b border-gray-800 h-auto p-4'>
    //     <p className='text-sm font-medium'>Si tiene alguna pregunta, envíenos un mensaje a <span className='text-cyan-500'>contacto@basquetid.com.</span>  Nos encantaría saber de ti. - Equipo Basquet ID</p>
    //     <p className='text-sm font-medium'>- Equipo Basquet ID</p>
    //   </div>
    //   <div className='w-full flex flex-col gap-y-4 items-start justify-start border-b border-gray-800 h-auto p-4'>
    //     <p className='text-sm font-medium'>Si estás recibiendo este correo electrónico es porque se suscribió para recibir correos electrónicos de marketing. Si prefiere no recibir estos correos electrónicos, <span className='text-cyan-500'>cancele la suscripción.</span></p>
    //   </div>
    //   <div className='flex w-full justify-between items-center'>
    //     <div className='flex gap-x-2'>
    //       <img className='w-12 h-10' src='url de youtube' />
    //       <img className='w-12 h-10' src='url de facebook' />
    //       <img className='w-12 h-10' src='url de twiter' />
    //       <img className='w-12 h-10' src='url de linkedin' />
    //     </div>
    //     <div className='flex flex-col gap-y-2 items-end text-sm font-semibold'>
    //       <p>© 2023 Basquet ID S.A</p>
    //       <p>direccion</p>
    //     </div>
    //   </div>
    // </section>
<>
</>
  )
}

export default page