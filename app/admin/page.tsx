"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_AUTH_KEY,
  loadEntries,
  type VolunteerLogEntry,
} from "@/lib/volunteer-log";

type LoginResponse = {
  ok?: boolean;
  error?: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState<VolunteerLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newVolunteerName, setNewVolunteerName] = useState("");
  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())
  

  function refreshEntries() {
    setEntries(loadEntries().slice().reverse());
  }

  useEffect(() => {
    const isAuthed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";

    setAuthenticated(isAuthed);
    if (isAuthed) refreshEntries();
  }, []);

  async function handleLogin() {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setError(payload.error ?? "Unable to sign in.");
        return;
      }

      window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
      setAuthenticated(true);
      setError("");
      refreshEntries();
    } catch {
      setError("Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    setAuthenticated(false);
    setPassword("");
    setSearch("");
  }

  async function handleAddVolunteer() {
    const fullName = newVolunteerName.trim();
  
    if (!fullName) return;
  
    const parts = fullName.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");
  
    if (!lastName) {
      setError("Please enter a first and last name.");
      return;
    }
  
    const res = await fetch("/api/volunteers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
      }),
    });
  
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to add volunteer.");
      return;
    }
  
    setNewVolunteerName("");
    setShowModal(false);
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
              onClick={() => void handleLogin()}
              disabled={isSubmitting}
              className="mt-8 w-full rounded-2xl bg-[#a61c1c] py-4 text-xl font-semibold text-white transition hover:bg-[#8f1616] disabled:cursor-not-allowed disabled:bg-[#a61c1c]/60"
            >
              {isSubmitting ? "Checking..." : "Enter"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] px-4 py-10 text-neutral-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section className="admin-card w-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#a61c1c] sm:text-5xl">
              Volunteer Time Log
            </h1>
            <p className="text-3xl text-neutral-700">{currentDate}</p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-3 sm:max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search volunteer name"
              className="w-full rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-lg outline-none focus:border-[#a61c1c] focus:ring-4 focus:ring-[#a61c1c]/10 sm:max-w-sm"
            />
            <button
               onClick={() => setShowModal(true)}
              className="rounded-2xl bg-[#a61c1c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8f1616]"
                >
                 Add New Volunteer
              </button>
          </div>
              

            <div className="flex gap-3">
              <button
                onClick={refreshEntries}
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

          {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-[#a61c1c]">
        Add New Volunteer
      </h2>

      <input
        value={newVolunteerName}
        onChange={(e) => setNewVolunteerName(e.target.value)}
        placeholder="Volunteer name"
        className="mt-4 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#a61c1c]"
      />

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            setShowModal(false);
            setNewVolunteerName("");
          }}
          className="rounded-xl bg-neutral-300 px-4 py-2"
        >
          Cancel
        </button>

        <button
          onClick={handleAddVolunteer}
          className="rounded-xl bg-[#a61c1c] px-4 py-2 text-white"
        >
          Add
        </button>
      </div>
    </div>
  </div>
)}
        </section>
      </div>
    </main>
  );
}
