"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

type WeatherRealtimeListenerProps = {
  favoriteCityIds: string[];
};

type WeatherInsertPayload = {
  new: {
    city_id?: string;
  };
};

export function WeatherRealtimeListener({
  favoriteCityIds
}: WeatherRealtimeListenerProps) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const favoriteCityIdSet = useMemo(() => new Set(favoriteCityIds), [favoriteCityIds]);

  useEffect(() => {
    if (favoriteCityIdSet.size === 0) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`weather-readings:${favoriteCityIds.slice().sort().join(",")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "weather_readings"
        },
        (payload) => {
          const typedPayload = payload as WeatherInsertPayload;
          const cityId = typedPayload.new.city_id;

          if (!cityId || !favoriteCityIdSet.has(cityId)) {
            return;
          }

          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }

          refreshTimeoutRef.current = setTimeout(() => {
            startTransition(() => {
              router.refresh();
            });
          }, 300);
        }
      )
      .subscribe();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      supabase.removeChannel(channel);
    };
  }, [favoriteCityIdSet, favoriteCityIds, router]);

  return null;
}
