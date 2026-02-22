'use client'
import NavTags from "@/components/events/nav-tags";
import { useSearchParams } from "next/navigation";
import NumeratedHanlder from "./place-type/numerated/numerated-handler";
import SectorizatedPlace from "./place-type/secotrizated/sectorizated-place";
import { useEventContext } from "../context/eventContext";
import EventNumeratedCart from "@/components/events/event-numerated-cart";

export default function PlacePage() {

  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const { event } = useEventContext()

  return (
    <>
      {type === 'numerated' ? <NumeratedHanlder event={event} /> : <SectorizatedPlace />}
    </>
  );
}
