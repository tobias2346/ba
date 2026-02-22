// app/page.tsx (SERVER)
import { API_BASE_URL } from "@/services/enviroment";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function page() {
  let data: any = {};

  try {
    const res = await fetch(`${API_BASE_URL}/events/home`, {
      cache: "no-store",
    });

    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.error(err);
  }

  return <ClientPage data={data} />;
}
