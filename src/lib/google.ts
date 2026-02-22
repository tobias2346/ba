// src/lib/google.ts

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;
const PLACES_API_BASE = "https://places.googleapis.com/v1";

/**
 * Llama a la API Places Autocomplete (v1) para obtener sugerencias de lugares.
 * @param input Texto de entrada (consulta de búsqueda).
 * @returns Objeto JSON con las sugerencias devueltas por Places API.
 */
export async function googlePlacesAutocomplete(input: string) {
  const url = `${PLACES_API_BASE}/places:autocomplete`;
  const body = JSON.stringify({
    input,
    includedRegionCodes: ["ar", "br"], // Restricción a Argentina y Brasil:contentReference[oaicite:0]{index=0}
    // Se podrían incluir más parámetros opcionales aquí (bias, types, etc.) según necesidad.
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Enviar cuerpo JSON:contentReference[oaicite:1]{index=1}
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY, // API Key en cabecera para autenticación:contentReference[oaicite:2]{index=2}
      // 'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text'
      // ^ FieldMask opcional para limitar los campos recibidos (p.ej. solo placeId y texto).
    },
    body,
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Places Autocomplete error: ${errorMsg}`);
  }
  return await response.json();
}

/**
 * Llama a la API Places Details (v1) para obtener detalles de un lugar específico.
 * @param placeId ID de lugar (place_id) obtenido del autocompletado.
 * @returns Objeto JSON con los detalles del lugar (dirección formateada, coordenadas, etc.).
 */
export async function googlePlaceDetails(placeId: string) {
  const fields = "formattedAddress,location"; // Solicitamos solo dirección formateada y ubicación (lat/lng)
  const url = `${PLACES_API_BASE}/places/${placeId}?fields=${fields}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY, // API Key en cabecera (alternativa a ?key=):contentReference[oaicite:3]{index=3}
      "Content-Type": "application/json",
      // 'X-Goog-FieldMask': 'formattedAddress,location' // También se puede usar cabecera para fields
    },
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Places Details error: ${errorMsg}`);
  }
  return await response.json();
}
