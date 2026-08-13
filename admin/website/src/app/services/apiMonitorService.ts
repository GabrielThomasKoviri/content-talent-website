export interface ApiLogEntry {
  id: string;
  timestamp: string;
  url: string;
  method: string;
  status: number;
  ok: boolean;
  data: any;
  durationMs?: number;
}

type Listener = (logs: ApiLogEntry[]) => void;

class ApiMonitorStore {
  private logs: ApiLogEntry[] = [];
  private listeners: Set<Listener> = new Set();

  public addLog(entry: Omit<ApiLogEntry, "id" | "timestamp">) {
    const newLog: ApiLogEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    this.logs = [newLog, ...this.logs].slice(0, 50); // Keep max 50 recent logs
    this.notify();
  }

  public getLogs() {
    return this.logs;
  }

  public clear() {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.logs));
  }
}

export const apiMonitorStore = new ApiMonitorStore();
