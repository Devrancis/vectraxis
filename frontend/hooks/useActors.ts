import { useQuery } from "@tanstack/react-query";
import { fetchActors, fetchActorDetail, fetchComparison } from "@/lib/api";

export function useActors(industry?: string, country?: string) {
  return useQuery({
    queryKey: ["actors", { industry, country }],
    queryFn: () => fetchActors(industry, country),
  });
}

export function useActorDetail(actorId: string | null) {
  return useQuery({
    queryKey: ["actor", actorId],
    queryFn: () => fetchActorDetail(actorId!),
    enabled: !!actorId, // Only fetch if an actor is actually selected
  });
}

export function useCompareActors(actor1: string | null, actor2: string | null) {
  return useQuery({
    queryKey: ["compare", actor1, actor2],
    queryFn: () => fetchComparison(actor1!, actor2!),
    enabled: !!actor1 && !!actor2, // Only trigger when both actors are selected
  });
}