export function createE2ERunId() {
  return `e2e-${Date.now()}`
}

export function createE2EEmail(prefix: string, runId: string) {
  return `${prefix}.${runId}@example.com`
}

export function createE2EName(label: string, runId: string) {
  return `E2E ${label} ${runId}`
}
