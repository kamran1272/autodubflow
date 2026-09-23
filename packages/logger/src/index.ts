type LogContext = Record<string, unknown>;

export const createLogger = (service: string) => ({
  info: (message: string, context: LogContext = {}) =>
    console.log(JSON.stringify({ level: 'info', service, message, ...context })),
  warn: (message: string, context: LogContext = {}) =>
    console.warn(JSON.stringify({ level: 'warn', service, message, ...context })),
  error: (message: string, context: LogContext = {}) =>
    console.error(JSON.stringify({ level: 'error', service, message, ...context })),
  debug: (message: string, context: LogContext = {}) =>
    console.debug(JSON.stringify({ level: 'debug', service, message, ...context })),
});

export const loggerStatus = 'logger-ready';
export type { LogContext };
