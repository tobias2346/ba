"use client";
import { useEffect, useState } from "react";
import Sell from "./sell";
import Past from "./past";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";

const Page = () => {
  const [activeTab, setActiveTab] = useState("sell");
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = () => {
      if (!user || (user.role !== "rrpp" && user.role !== "rrpp-leader")) {
        router.push("/");
        return null;
      }
    };

    checkAccess();
  }, [user]);

  return (
    <section className="w-full px-2 md:px-20">
      {/* Tabs */}
      <div className="flex gap-4  py-2 mt-6">
        <button
          onClick={() => setActiveTab("sell")}
          className={`text-sm md:text-base px-2 md:px-4 py-2 font-medium ${
            activeTab === "sell"
              ? "border-b-2 border-cyan-500 text-cyan-500"
              : "text-gray-500"
          }`}
        >
          Mis eventos en venta
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`text-sm md:text-base px-2 md:px-4 py-2 font-medium ${
            activeTab === "past"
              ? "border-b-2 border-cyan-500 text-cyan-500"
              : "text-gray-500"
          }`}
        >
          Mis eventos pasados
        </button>
      </div>

      {/* Contenido dinámico */}
      <div className="mt-4">
        {activeTab === "sell" && <Sell />}
        {activeTab === "past" && <Past />}
      </div>
    </section>
  );
};

export default Page;
