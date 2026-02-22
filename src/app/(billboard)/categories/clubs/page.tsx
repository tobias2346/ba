import ClubCard, { Club } from "@/app/(billboard)/categories/clubs/club-card";
import { API_BASE_URL } from "@/services/enviroment";
import { toast } from "sonner";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function ClubsPage(props: { searchParams: SearchParams; }) {

  const searchParams = await props.searchParams;
  const categoryId = searchParams.categoryId;

  let data = []

  try {
    const res = await fetch(`${API_BASE_URL}/stores?categoryId=${categoryId}`);
    if (!res.ok) throw new Error("Error obteniendo los clubes");
    data = await res.json();
  } catch (error: any) {
    toast.error(error.message);
    throw new Error('Error')
  }

  return (
    <section className="flex h-auto flex-col w-full justify-start items-start my-14 px-[15vh] min-h-[70vh]">
      <h1 className="text-3xl font-headline font-bold mb-8">Clubes</h1>
      <div className="flex flex-wrap gap-6 min-h-[40vh]">
        {data.map((club: Club) => <ClubCard key={club.id} club={club} />)}
      </div>
    </section>
  );
}
