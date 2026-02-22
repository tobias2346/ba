"use client";
import React, { useEffect, useState, use } from "react";
import RrppTag from "./rrpp-tag";
import { API_BASE_URL } from "@/services/enviroment";
import { useUser } from "@/contexts/user-context";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const rrpp = searchParams.get("rrpp");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const entorno = process.env.NEXT_PUBLIC_ENTORNO;
  const credentialsOption: RequestCredentials =
    entorno !== "develop" ? "include" : "omit";

  const copyAliasToClipboard = () => {
    const urlOrigin = window.location.origin;
    const url = new URL(data?.rrppLink, urlOrigin).toString();
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  const total = data?.summary?.reduce(
    (acc, item) => acc + item.commissionEarned,
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/rrpp/${rrpp}/events/${id}/sales`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: credentialsOption,
          }
        );
        if (!res.ok) throw new Error("Error al obtener los datos");
        const result = await res.json();
        console.log(result);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <section className="h-auto overflow-y-auto flex-1 flex flex-col items-start p-4 md:p-20 py-4 gap-y-4 w-full relative mb-80">
      <h4 className="text-2xl font-semibold font-headline">
        Resumen del ventas
      </h4>
      {
        loading ?
          <>
            <div className="w-full max-w-4xl bg-secondary h-auto md:h-16 flex flex-col md:flex-row justify-between p-4 md:px-6 rounded-lg gap-4 animate-pulse "></div>
            <div className="w-full max-w-4xl bg-secondary h-auto md:h-20 flex flex-col md:flex-row justify-between p-4 md:px-6 rounded-lg gap-4 animate-pulse "></div>
            <div className="w-full max-w-4xl bg-secondary h-auto md:h-16 flex flex-col md:flex-row justify-between p-4 md:px-6 rounded-lg gap-4 animate-pulse "></div>
          </>
          :
          <>
            <div className="w-full max-w-4xl bg-secondary h-auto md:h-16 flex flex-col md:flex-row justify-between p-4 md:px-6 rounded-lg gap-4">
              {
                data?.rrppCommisions &&
                <>
                  <div className=" flex flex-col md:flex-row items-center gap-4 md:gap-12">
                    <h4 className=" font-semibold font-headline">
                      Comisión tickets : {data?.rrppCommisions?.ticket}
                      <span className="text-primary">%</span>
                    </h4>
                    <h4 className=" font-semibold font-headline">
                      Comisión combos : {data?.rrppCommisions?.combo}
                      <span className="text-primary">%</span>
                    </h4>
                    <span className="w-full h-px bg-slate-400 md:hidden"></span>
                    <h4 className=" font-semibold font-headline md:hidden">
                      Total combos : {data?.qtCountCombo}
                    </h4>
                    <h4 className=" font-semibold font-headline md:hidden">
                      Total tickets : {data?.qtCountTicket}
                    </h4>
                    <h4 className=" font-semibold font-headline md:hidden">
                      Total comisionado : {total}
                    </h4>
                  </div>
                  <Button className={`${data?.eventStatus === 'finished' && 'hidden'}`} size="sm" onClick={copyAliasToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Link
                  </Button>
                </>
              }
            </div>
            <div className="w-full max-w-4xl bg-dark  h-auto md:h-14 hidden md:flex flex-col md:flex-row justify-around p-4 md:px-6 rounded-lg gap-4">
              <h4 className=" font-semibold font-headline">
                Total combos : {data?.qtCountCombo}
              </h4>
              <h4 className=" font-semibold font-headline">
                Total tickets : {data?.qtCountTicket}
              </h4>
              <h4 className=" font-semibold font-headline">
                Total comisionado : {total}
              </h4>
            </div>
          </>
      }
      {data?.summary?.map((e) => (
        <RrppTag key={e} {...e} />
      ))}
    </section>
  );
};

export default Page;
