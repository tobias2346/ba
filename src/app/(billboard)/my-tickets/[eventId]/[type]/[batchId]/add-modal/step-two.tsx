import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { UserCircle } from 'lucide-react'

const StepTwo = ({ newUser }) => {

  return (
    <section className='flex flex-col w-full items-center gap-y-3 font-headline '>
      <article className='flex gap-4 bg-background rounded-xl shadow p-4 w-full'>
        <Avatar className="h-10 w-10">
          <AvatarImage src={newUser?.photo as string} alt={newUser?.name as string} />
          <AvatarFallback>
            <UserCircle className="h-full w-full text-primary" />
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-y-1'>
          <h3 className='text-base font-semibold'>{newUser?.name}</h3>
          <h6 className='text-sm'>{newUser?.alias}</h6>
          <h6 className='text-sm'>{newUser?.email}</h6>
        </div>
      </article>

    </section>
  )
}

export default StepTwo