import { request } from "./client";

export interface LearningCardStats {
  total_learning: number;
  due_count: number;
  true_retention: number;
  average_stability: number;
  estimated_recalled: number;
  timestamp: string;
}

export interface GetLearningStatsParams {
  tz_name?: string;
  days?: number | null;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface LearningTimeSeries {
  metric: string;
  unit: string;
  data: TimeSeriesPoint[];
}

export interface GetLearningTimeseriesParams {
  metric?: string;
  tz_name?: string;
  days?: number | null;
}

export async function getLearningStats(
  params?: GetLearningStatsParams,
): Promise<LearningCardStats> {
  const q = new URLSearchParams();
  const tz =
    params?.tz_name ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Asia/Ho_Chi_Minh";
  if (tz) q.set("tz_name", tz);
  if (params?.days !== undefined && params?.days !== null) {
    q.set("days", String(params.days));
  }

  const qs = q.toString();
  return request<LearningCardStats>(
    `/brick-memories/stats${qs ? `?${qs}` : ""}`,
  );
}

export async function getLearningTimeseries(
  params?: GetLearningTimeseriesParams,
): Promise<LearningTimeSeries> {
  const q = new URLSearchParams();
  const tz =
    params?.tz_name ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Asia/Ho_Chi_Minh";
  if (tz) q.set("tz_name", tz);
  if (params?.metric) q.set("metric", params.metric);
  if (params?.days !== undefined && params?.days !== null) {
    q.set("days", String(params.days));
  }

  const qs = q.toString();
  return request<LearningTimeSeries>(
    `/brick-memories/stats/timeseries${qs ? `?${qs}` : ""}`,
  );
}
