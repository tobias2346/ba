import React from 'react'

const EventNumeratedCart = ({ sector, seats }) => {

  return (
    <div className='w-80 2xl:w-96 flex flex-col gap-px'>
      <div className='w-full h-auto py-4 bg-slate-800 rounded-t-lg flex flex-col p-6 gap-y-6'>
        <h5 className='font-headline text-lg'>Resumen de pedido</h5>
        <h5 className='font-headline text-2xl font-semibold'>{sector?.name}</h5>
        {
          sector?.price ?
            <div className='font-medium text-slate-300'>
              <div className='w-full flex items-center justify-between'>
                <h4>Precio del sector: </h4>
                <h4>{sector.price}$</h4>
              </div>
              <div className='w-full flex items-center justify-between'>
                <h4>Maximo de personas: </h4>
                <h4>{sector.maxPerPerson}</h4>
              </div>
              {
                seats?.map(item => <div key={item} className='w-full flex items-center justify-between'>
                  <h4>Butaca ( {item} )</h4>
                  <h4>x1</h4>
                </div>)
              }
            </div>
            :
            <div className='w-full rounded-xl ring-2 flex justify-center items-center py-3 text-slate-400 ring-slate-600'>Sin tickets</div>
        }
      </div>
        <div className='w-full h-auto py-4 bg-slate-800 flex justify-between items-center p-6 rounded-b'>
          <h4 className='text-lg'>Total</h4>
          <h5 className='font-semibold text-lg'>{ sector?.price ? sector.price * seats.length : 0}$</h5>
        </div>
    </div>
  )
}

export default EventNumeratedCart