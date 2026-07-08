import { NextFunction, Request, Response } from "express";
import {
  activeRequests,
  httpRequestDuration,
  httpRequestsTotal,
  requestSize,
  responseSize,
} from "../metrics/http";

export function prometheusMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  activeRequests.inc();

  if (req.headers["content-length"]) {
    requestSize.observe(Number(req.headers["content-length"]));
  }

  const end = httpRequestDuration.startTimer({
    method: req.method,
    route: req.route?.path ?? req.path,
    status: "",
  });

  res.on("finish", () => {
    activeRequests.dec();

    const labels = {
      method: req.method,
      route: req.route?.path ?? req.path,
      status: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);

    end(labels);

    const length = res.getHeader("content-length");
    if (length) {
      responseSize.observe(Number(length));
    }
  });

  next();
}
