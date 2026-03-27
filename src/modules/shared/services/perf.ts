export type PerfLogEntry = {
  label: string;
  elapsedMs: number;
};

export type PerfLogger = (entry: PerfLogEntry) => void;

const defaultLogger: PerfLogger = (entry) => {
  console.info("[PERF]", entry);
};

export async function measureAsync<T>(
  label: string,
  run: () => Promise<T>,
  logger: PerfLogger = defaultLogger,
) {
  const startedAt = Date.now();
  const result = await run();

  logger({
    label,
    elapsedMs: Date.now() - startedAt,
  });

  return result;
}
