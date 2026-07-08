import { Histogram } from "prom-client";
import { apiCalls, apiFailures, apiLatency } from "./api";

export async function monitor<T>(
  histogram: Histogram<string>,
  labels: Record<string, string>,
  operation: () => Promise<T>,
): Promise<T> {
  const end = histogram.startTimer(labels);

  try {
    return await operation();
  } finally {
    end();
  }
}

export async function monitorApi<T>(
  method: string,
  endpoint: string,
  request: () => Promise<T>,
): Promise<T> {
  const end = apiLatency.startTimer({
    method,
    endpoint,
  });

  try {
    const result = await request();

    apiCalls.inc({
      method,
      endpoint,
      status: "success",
    });

    return result;
  } catch (err) {
    apiFailures.inc({
      method,
      endpoint,
    });

    throw err;
  } finally {
    end();
  }
}
