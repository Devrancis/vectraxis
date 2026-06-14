import { useQuery } from "@tanstack/react-query";
import { fetchMatrix } from "@/lib/api";

export function useMatrix() {
  return useQuery({
    queryKey: ["matrix"],
    queryFn: fetchMatrix,
  });
}