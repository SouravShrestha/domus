const LOG_PREFIX = "[Domus API]";

function formatMessage(service: string, message: string): string {
  return `${LOG_PREFIX} [${service}] ${message}`;
}

export const apiLogger = {
  info(service: string, message: string, data?: unknown) {
    console.warn(formatMessage(service, message), data ?? "");
  },

  warn(service: string, message: string, data?: unknown) {
    console.warn(formatMessage(service, message), data ?? "");
  },

  error(service: string, message: string, error?: unknown) {
    console.error(formatMessage(service, message), error ?? "");
  },
};
