// src/app/api/maps/autocomplete/route.ts
import { NextResponse } from "next/server";
import { googlePlacesAutocomplete } from "@/lib/google";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");
  if (!input) {
    return NextResponse.json(
      { error: 'Falta el parámetro "input"' },
      { status: 400 }
    );
  }

  try {
    // Llamada al helper para obtener datos de autocompletado desde Places API
    const data = await googlePlacesAutocomplete(input);
    const suggestions = data.suggestions || [];

    // Filtrar solo predicciones de lugares (ignorando queryPredictions si las hubiera) y mapear al formato necesario
    const results = suggestions
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        description: s.placePrediction.text?.text, // Texto descriptivo de la sugerencia
        place_id: s.placePrediction.placeId, // ID de lugar necesario para buscar detalles
      }));

    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    console.error("Autocomplete error:", err);
    return NextResponse.json(
      { error: "Error obteniendo sugerencias" },
      { status: 500 }
    );
  }
}
