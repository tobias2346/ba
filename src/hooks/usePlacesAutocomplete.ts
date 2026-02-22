// src/hooks/usePlacesAutocomplete.ts
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type Suggestion = {
  description: string;
  place_id: string;
};

export type PlaceDetails = {
  formattedAddress: string | null;
  lat: number | null;
  lng: number | null;
};

export function usePlacesAutocomplete(query: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const clearSuggestions = () => setSuggestions([]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const q = (query ?? '').trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/maps/autocomplete?input=${encodeURIComponent(q)}`);
        // NUEVO backend devuelve array simple de items [{ description, place_id }]
        const data = await res.json();
        const items: Suggestion[] = Array.isArray(data) ? data : (data?.predictions ?? []);
        setSuggestions(
          (items ?? []).map((p: any) => ({
            description: p.description ?? '',
            place_id: p.place_id ?? '',
          }))
        );
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const selectPlace = useMemo(() => {
    return async (place_id: string): Promise<PlaceDetails> => {
      const res = await fetch(`/api/maps/place-details?place_id=${encodeURIComponent(place_id)}`);
      const data = await res.json();
      return {
        formattedAddress: data.formatted_address ?? data.formattedAddress ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
      };
    };
  }, []);

  return { suggestions, loading, selectPlace, clearSuggestions };
}
