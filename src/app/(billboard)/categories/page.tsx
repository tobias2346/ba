import Link from 'next/link';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/services/enviroment';
import Image from 'next/image';

export default async function CategoriesPage() {

  let data;
  try {
    const res = await fetch(`${API_BASE_URL}/stores/categories`);
    if (!res.ok) throw new Error("Error obteniendo categorías");
    data = await res.json();
  } catch (error: any) {
    toast.error(error.message);
    throw new Error('Error')
  }

  return (
    <section className='w-full flex flex-col items-center gap-4 my-8 min-h-[80vh]'>
      <h1 className='text-2xl md:text-3xl font-semibold font-headline my-4'>Categorías</h1>
      {
        data.map((cat: any) => (
          <Link
            className='bg-secondary hover:bg-primary/50 rounded-xl w-4/5 md:w-96 h-20 flex justify-center items-center gap-8 font-semibold text-lg'
            href={`/categories/clubs?categoryId=${cat.id}`}
            key={cat.id}
          >
            <Image width={100} height={100} className='w-auto h-3/4' alt='Categorie logo' src={cat.logo} />
            {cat.name}
          </Link>
        ))
      }
    </section>
  );
}
