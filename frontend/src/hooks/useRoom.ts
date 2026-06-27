"use client";

import useSWR from "swr";
import type { ApiResponse, RoomDetail } from "@/lib/contracts/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRoom(roomId: string | null) {
  const { data, error, mutate } = useSWR<ApiResponse<RoomDetail>>(
    roomId ? `/api/rooms/${roomId}` : null,
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    roomDetail: data?.success ? data.data : null,
    isLoading: !error && !data,
    isError: error || (data && !data.success ? data.error : null),
    mutate,
  };
}
