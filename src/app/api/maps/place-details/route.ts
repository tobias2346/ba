// src/app/api/maps/place-details/route.ts
import { NextResponse } from "next/server";
import { googlePlaceDetails } from "@/lib/google";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("place_id");
  if (!placeId) {
    return NextResponse.json(
      { error: 'Falta el parámetro "place_id"' },
      { status: 400 }
    );
  }

  try {
    // Llamar al helper para obtener detalles del lugar desde Places API
    const data = await googlePlaceDetails(placeId);
    const formattedAddress = data.formattedAddress;
    const location = data.location;
    const lat = location?.latitude;
    const lng = location?.longitude;

    return NextResponse.json(
      {
        formatted_address: formattedAddress,
        lat,
        lng,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Place details error:", err);
    return NextResponse.json(
      { error: "Error obteniendo detalles del lugar" },
      { status: 500 }
    );
  }
}
