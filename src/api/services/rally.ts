import { apiClient } from "@/api/client";
import axios from "axios";
import type {
  GetActiveRallyResponse,
  GetChallengesResponse,
  GetRallyEventsQuery,
  GetRallyEventsResponse,
} from "@/api/types/rally";

export async function getActiveRally(): Promise<GetActiveRallyResponse> {
  const { data } = await apiClient.get<GetActiveRallyResponse>("/rally/active");
  return data;
}

export async function getRallyChallenges(
  eventId: string,
): Promise<GetChallengesResponse> {
  const { data } = await apiClient.get<GetChallengesResponse>(
    `/rally/${eventId}/challenges`,
  );
  return data;
}

export async function getRallyEvents(
  query: GetRallyEventsQuery,
): Promise<GetRallyEventsResponse> {
  try {
    const { data } = await apiClient.get<GetRallyEventsResponse>("/rally", {
      params: query,
    });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message =
        typeof err.response?.data === "object" &&
        err.response?.data &&
        "message" in err.response.data
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err.response.data as any).message
          : null;
      if (message && typeof message === "string") {
        throw new Error(message);
      }
    }
    throw err;
  }
}

