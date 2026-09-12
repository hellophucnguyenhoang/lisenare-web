import { useQuery } from "@tanstack/react-query";
import {
  getLearningStats,
  getLearningTimeseries,
  type GetLearningStatsParams,
  type GetLearningTimeseriesParams,
} from "@/api/stats";

export function useLearningStats(
  params?: GetLearningStatsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["learning-stats", params],
    queryFn: () => getLearningStats(params),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useLearningTimeseries(
  params?: GetLearningTimeseriesParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["learning-timeseries", params],
    queryFn: () => getLearningTimeseries(params),
    enabled,
    staleTime: 60 * 1000,
  });
}
