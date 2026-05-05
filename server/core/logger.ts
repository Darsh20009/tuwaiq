type LogLevel = "info" | "warn" | "error" | "debug";

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function log(level: LogLevel, source: string, message: string, data?: any): void {
  const time = formatTime();
  const prefix = `${time} [${level.toUpperCase()}] [${source}]`;

  if (level === "error") {
    console.error(`${prefix} ${message}`, data !== undefined ? data : "");
  } else if (level === "warn") {
    console.warn(`${prefix} ${message}`, data !== undefined ? data : "");
  } else {
    console.log(`${prefix} ${message}`, data !== undefined ? data : "");
  }
}

export const logger = {
  info: (source: string, message: string, data?: any) => log("info", source, message, data),
  warn: (source: string, message: string, data?: any) => log("warn", source, message, data),
  error: (source: string, message: string, data?: any) => log("error", source, message, data),
  debug: (source: string, message: string, data?: any) => {
    if (process.env.NODE_ENV !== "production") {
      log("debug", source, message, data);
    }
  },
};
