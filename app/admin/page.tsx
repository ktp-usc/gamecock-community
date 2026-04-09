"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_AUTH_KEY,
  ADMIN_PASSWORD,
} from "@/lib/volunteer-log";
import type { VolunteerRecord } from "@/lib/api/volunteers";
import type { TimeEntryRecord } from "@/lib/time-entries";

type VolunteerLogEntry = {
  id: string;
  name: string;
  dateLabel: string;
  clockInLabel: string;
  clockOutLabel: string;
  totalHours: string;
};

type VolunteersResponse = {
  volunteers?: VolunteerRecord[];
  error?: string;
};

type TimeEntriesResponse = {
  timeEntries?: TimeEntryRecord[];
  error?: string;
};
// correctly format the date
function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  }).format(date);
}
// correctly format the time
function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// format the total hours
function formatHours(startISO: string, endISO: string) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const totalMinutes = Math.max(0, Math.round((end - start) / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) { // less than an hour, only show minutes
    return `${minutes}m`;
  }

  if (minutes === 0) { // 0 minutes, only show hour
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`; // otherwise show hours and minutes
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState<VolunteerLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function refreshEntries() {
    try {
      setError("");

      const [volunteersResponse, timeEntriesResponse] = await Promise.all([
        fetch("/api/volunteers"),
        fetch("/api/time-entries"),
      ]);

      const volunteersPayload =
        (await volunteersResponse.json()) as VolunteersResponse;
      const timeEntriesPayload =
        (await timeEntriesResponse.json()) as TimeEntriesResponse;

      if (!volunteersResponse.ok) {
        throw new Error(
          volunteersPayload.error ?? "Unable to load volunteers.",
        );
      }

      if (!timeEntriesResponse.ok) {
        throw new Error(
          timeEntriesPayload.error ?? "Unable to load time entries.",
        );
      }

      const volunteerMap = new Map(
        (volunteersPayload.volunteers ?? []).map((volunteer) => [
          volunteer.id,
          `${volunteer.firstName} ${volunteer.lastName}`,
        ]),
      );

      const nextEntries = (timeEntriesPayload.timeEntries ?? [])
        .slice()
        .sort(
          (firstEntry, secondEntry) =>
            new Date(secondEntry.clockIn).getTime() -
            new Date(firstEntry.clockIn).getTime(),
        )
        .map((entry) => {
          const clockInDate = new Date(entry.clockIn);
          const clockOutDate = entry.clockOut ? new Date(entry.clockOut) : null;

          return {
            id: entry.id,
            name: volunteerMap.get(entry.volunteerId) ?? "Unknown volunteer",
            dateLabel: formatDateLabel(clockInDate),
            clockInLabel: formatTimeLabel(clockInDate),
            clockOutLabel: clockOutDate ? formatTimeLabel(clockOutDate) : "",
            totalHours: clockOutDate
              ? formatHours(entry.clockIn, entry.clockOut!)
              : "",
          };
        });

      setEntries(nextEntries);
    } catch (loadError) {
      setEntries([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load volunteer log.",
      );
    }
  }

  useEffect(() => {
    const isAuthed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";

    setAuthenticated(isAuthed);
    if (isAuthed) {
      void refreshEntries();
    }
  }, []);

  function handleLogin() {
    if (password !== ADMIN_PASSWORD) {
      setError("Incorrect password.");
      return;
    }

    window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
    setAuthenticated(true);
    setError("");
    void refreshEntries();
  }

  function handleLogout() {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    setAuthenticated(false);
    setPassword("");
    setSearch("");
  }

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => entry.name.toLowerCase().includes(q));
  }, [entries, search]);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-black px-4 py-12 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
          <section className="w-full rounded-[28px] bg-white p-8 text-neutral-900 shadow-2xl">
            <h1 className="text-center text-4xl font-bold text-[#a61c1c]">
              Admin Access
            </h1>
            <p className="mt-4 text-center text-lg text-neutral-600">
              Enter the admin password to view the volunteer log.
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mt-8 w-full rounded-2xl border border-neutral-300 px-5 py-4 text-lg outline-none focus:border-[#a61c1c] focus:ring-4 focus:ring-[#a61c1c]/10"
            />

            {error ? (
              <p className="mt-3 text-sm font-medium text-[#a61c1c]">
                {error}
              </p>
            ) : null}

            <button
              onClick={handleLogin}
              className="mt-8 w-full rounded-2xl bg-[#a61c1c] py-4 text-xl font-semibold text-white transition hover:bg-[#8f1616]"
            >
              Enter
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section className="admin-card w-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#a61c1c] sm:text-5xl">
              Volunteer Time Log
            </h1>
            <p className="text-xl text-neutral-700">March 2026</p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search volunteer name"
              className="w-full rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-lg outline-none focus:border-[#a61c1c] focus:ring-4 focus:ring-[#a61c1c]/10 sm:max-w-sm"
            />

            <div className="flex gap-3">
              <button
                onClick={() => void refreshEntries()}
                className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="rounded-2xl bg-[#a61c1c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f1616]"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[10px] border border-neutral-300 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full">
                <thead>
                  <tr className="bg-[#a61c1c] text-white">
                    <th>Name</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-lg text-neutral-500">
                        No volunteer entries yet.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry, index) => (
                      <tr key={entry.id} className={index % 2 === 0 ? "even" : "odd"}>
                        <td>{entry.name}</td>
                        <td>{entry.dateLabel}</td>
                        <td>{entry.clockInLabel}</td>
                        <td>{entry.clockOutLabel || "-"}</td>
                        <td>{entry.totalHours || "In progress"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
