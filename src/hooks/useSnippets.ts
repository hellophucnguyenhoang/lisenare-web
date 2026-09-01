import { useQuery } from "@tanstack/react-query";
import { getRandomSnippets } from "@/api/snippets";

export function useRandomSnippets(pageSize = 5) {
  return useQuery({
    queryKey: ["snippets", "random", pageSize],
    queryFn: () => getRandomSnippets(pageSize),
  });
}
