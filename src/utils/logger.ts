import type { LogContext, Logger } from "@/types/logging";

function write(level: "debug" | "info" | "warn" | "error", message: string, context?: LogContext) {
  const payload = context ? { message, ...context } : { message };
  console[level](payload);
}

export const consoleLogger: Logger = {
  debug: (message, context) => write("debug", message, context),
  info: (message, context) => write("info", message, context),
  warn: (message, context) => write("warn", message, context),
  error: (message, context) => write("error", message, context),
};

export function createLogger(baseContext: LogContext): Logger {
  return {
    debug: (message, context) => consoleLogger.debug(message, { ...baseContext, ...context }),
    info: (message, context) => consoleLogger.info(message, { ...baseContext, ...context }),
    warn: (message, context) => consoleLogger.warn(message, { ...baseContext, ...context }),
    error: (message, context) => consoleLogger.error(message, { ...baseContext, ...context }),
  };
}
