import { Histogram } from "prom-client";
import { mongoErrors, mongoLatency, mongoQueries } from "./database";

export async function measure<T>(
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

export async function monitorMongo<T>(
  collection: string,
  operation: string,
  query: () => Promise<T>,
): Promise<T> {
  const end = mongoLatency.startTimer({
    collection,
    operation,
  });

  mongoQueries.inc({
    collection,
    operation,
  });

  try {
    return await query();
  } catch (err) {
    mongoErrors.inc({
      collection,
      operation,
    });

    throw err;
  } finally {
    end();
  }
}
