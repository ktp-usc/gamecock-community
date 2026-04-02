export type VolunteerLogEntry = {
    id: string;
    name: string;
    dateKey: string;
    dateLabel: string;
    clockInAt: string;
    clockInLabel: string;
    clockOutAt: string | null;
    clockOutLabel: string;
    totalHours: string;
  };
  
  export const LOG_STORAGE_KEY = "gamecock-volunteer-log";
  export const ADMIN_AUTH_KEY = "gamecock-admin-auth";
  export const ADMIN_PASSWORD = "gamecock2026";
  
  export const VOLUNTEER_NAMES = [
    "John Doe",
    "Jane Smith",
    "Micheal Brown",
    "Emily Johnson",
    "David Williams",
    "Eva Wilson",
    "Sarah Lee",
    "Daniel Kim",
    "Olivia Martinez",
    "Noah Anderson",
  ];
  
  export function getNow() {
    return new Date();
  }
  
  export function formatDateLabel(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    }).format(date);
  }
  
  export function formatDateKey(date: Date) {
    return new Intl.DateTimeFormat("en-CA").format(date);
  }
  
  export function formatTimeLabel(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  
  export function formatHours(startISO: string, endISO: string) {
    const start = new Date(startISO).getTime();
    const end = new Date(endISO).getTime();
    const hours = Math.max(0, (end - start) / 3_600_000);
    const rounded = Math.round(hours * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}h`;
  }
  
  export function loadEntries(): VolunteerLogEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(LOG_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as VolunteerLogEntry[]) : [];
    } catch {
      return [];
    }
  }
  
  export function saveEntries(entries: VolunteerLogEntry[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
  }
  
  export function addClockIn(name: string) {
    const entries = loadEntries();
    const openSession = [...entries].reverse().find((entry) => entry.name === name && !entry.clockOutAt);
  
    if (openSession) {
      return { ok: false, message: `${name} is already clocked in.` };
    }
  
    const now = getNow();
    const entry: VolunteerLogEntry = {
      id: crypto.randomUUID(),
      name,
      dateKey: formatDateKey(now),
      dateLabel: formatDateLabel(now),
      clockInAt: now.toISOString(),
      clockInLabel: formatTimeLabel(now),
      clockOutAt: null,
      clockOutLabel: "",
      totalHours: "",
    };
  
    saveEntries([...entries, entry]);
    return { ok: true, message: `${name} clocked in.` };
  }
  
  export function addClockOut(name: string) {
    const entries = loadEntries();
    const reversedIndex = [...entries]
      .reverse()
      .findIndex((entry) => entry.name === name && !entry.clockOutAt);
  
    if (reversedIndex === -1) {
      return { ok: false, message: `No open clock-in found for ${name}.` };
    }
  
    const index = entries.length - 1 - reversedIndex;
    const now = getNow();
    const updatedEntry = {
      ...entries[index],
      clockOutAt: now.toISOString(),
      clockOutLabel: formatTimeLabel(now),
      totalHours: formatHours(entries[index].clockInAt, now.toISOString()),
    };
  
    const updated = [...entries];
    updated[index] = updatedEntry;
    saveEntries(updated);
  
    return { ok: true, message: `${name} clocked out.` };
  }