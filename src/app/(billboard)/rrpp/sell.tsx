"use client";
import { EventCardLoading } from "@/components/shared/event-card-loading";
import { EventCardRrpp } from "@/components/shared/event-card-rrpp";
import { useUser } from "@/contexts/user-context";
import { API_BASE_URL } from "@/services/enviroment";
import { FolderSearch } from "lucide-react";
import React, { useEffect, useState } from "react";

const Sell = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const entorno = process.env.NEXT_PUBLIC_ENTORNO;
  const credentialsOption: RequestCredentials =
    entorno !== "develop" ? "include" : "omit";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/rrpp/${user!.id}/events`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: credentialsOption,
        });
        if (!res.ok) throw new Error("Error al obtener los datos");
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  return (
    <div className="w-full h-auto flex flex-wrap justify-center md:justify-start  gap-8 py-10">
      {
        loading ?
          <div className="w-full h-auto flex justify-center md:justify-start flex-wrap gap-8 mb-28">
            {[0, 1, 2].map((i) => <EventCardLoading key={i} />)}

          </div>
          : data?.events?.length < 1 ?
            <div className="w-full h-80 flex gap-8 justify-center items-center mb-60">
              <FolderSearch className="w-10 h-10 md:w-20 md:h-20" />
              <h1 className="text-xl font-semibold text-slate-300">No tienes eventos</h1>
            </div>
            : data?.events?.map((e) => (
              <EventCardRrpp
                key={e.id}
                {...e}
                href={`/rrpp/${e.id}?rrpp=${data.rrppId}`}
              />
            ))}
    </div>
  );
};

export default Sell;
