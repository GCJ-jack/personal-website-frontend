type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

function normalizeLevel(value?: string): LogLevel {
  const input = String(value ?? "").trim().toLowerCase();
  if (input === "debug" || input === "info" || input === "warn" || input === "error" || input === "silent") {
    return input;
  }
  return import.meta.env.DEV ? "debug" : "info";
}

const CURRENT_LEVEL = normalizeLevel(import.meta.env.VITE_LOG_LEVEL as string | undefined);

function shouldLog(level: LogLevel) {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[CURRENT_LEVEL];
}

function formatPrefix(scope: string, level: LogLevel) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] [${scope}]`;
}

function write(level: LogLevel, scope: string, message: string, meta?: unknown) {
  if (!shouldLog(level)) {
    return;
  }

  const prefix = formatPrefix(scope, level);
  if (meta === undefined) {
    console.log(`${prefix} ${message}`);
    return;
  }
  console.log(`${prefix} ${message}`, meta);
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, meta?: unknown) => write("debug", scope, message, meta),
    info: (message: string, meta?: unknown) => write("info", scope, message, meta),
    warn: (message: string, meta?: unknown) => write("warn", scope, message, meta),
    error: (message: string, meta?: unknown) => write("error", scope, message, meta),
  };
}
