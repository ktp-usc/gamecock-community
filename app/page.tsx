"use client";

import { useEffect, useMemo, useState } from "react";

import type { VolunteerRecord } from "@/lib/api/volunteers";

type VolunteerResponse = {
  volunteers?: VolunteerRecord[];
  error?: string;
};

type ClockResponse = {
  error?: string;
};

type StatusTone = "clock-in" | "clock-out" | "";

function getVolunteerLabel(volunteer: VolunteerRecord) {
  return `${volunteer.firstName} ${volunteer.lastName}`;
}

export default function Home() {
  const [time, setTime] = useState("");
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<StatusTone>("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());

    const interval = window.setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadVolunteers() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/volunteers");
        const payload = (await response.json()) as VolunteerResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load volunteers.");
        }

        setVolunteers(payload.volunteers ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load volunteers.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadVolunteers();
  }, []);

  const sortedVolunteers = useMemo(() => {
    return [...volunteers].sort((firstVolunteer, secondVolunteer) =>
      getVolunteerLabel(firstVolunteer).localeCompare(
        getVolunteerLabel(secondVolunteer),
      ),
    );
  }, [volunteers]);

  const filteredVolunteers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return sortedVolunteers;
    }

    return sortedVolunteers.filter((volunteer) =>
      getVolunteerLabel(volunteer).toLowerCase().includes(normalizedSearch),
    );
  }, [search, sortedVolunteers]);

  const selectedVolunteer = useMemo(() => {
    return volunteers.find((volunteer) => volunteer.id === selectedVolunteerId);
  }, [selectedVolunteerId, volunteers]);

  async function handleClockAction(
    endpoint: "/api/time-entries/clock-in" | "/api/time-entries/clock-out",
    actionLabel: "Clocked in" | "Clocked out",
    tone: Exclude<StatusTone, "">,
  ) {
    if (!selectedVolunteerId) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setStatusMessage("");
      setStatusTone("");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volunteerId: selectedVolunteerId }),
      });

      const payload = (await response.json()) as ClockResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save time entry.");
      }

      const volunteerName = selectedVolunteer
        ? getVolunteerLabel(selectedVolunteer)
        : "Volunteer";

      setStatusMessage(`${actionLabel}: ${volunteerName}`);
      setStatusTone(tone);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save time entry.",
      );
      setStatusTone("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-[#4a90e2] bg-white p-6 text-center shadow-[0_14px_30px_rgba(0,0,0,0.12)] sm:p-10">
        <h1 className="text-3xl font-semibold text-[#7a1c1c] sm:text-5xl">
          Gamecock Community Shop
        </h1>

        <h2 className="mt-6 text-2xl font-semibold text-slate-950 sm:text-4xl">
          Volunteer Clock-In
        </h2>

        <div className="mt-6 text-4xl font-light text-slate-950 sm:text-6xl">
          {time || "--:--:--"}
        </div>

        <hr className="my-8 border-slate-200" />

        <div className="text-left">
          <label
            htmlFor="volunteer-search"
            className="mb-3 block text-2xl font-semibold text-slate-950"
          >
            Select Your Name
          </label>

          <input
            id="volunteer-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by first or last name"
            className="mb-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg outline-none transition focus:border-[#4a90e2] focus:ring-4 focus:ring-[#4a90e2]/15"
          />

          <select
            value={selectedVolunteerId}
            onChange={(event) => setSelectedVolunteerId(event.target.value)}
            disabled={isLoading || filteredVolunteers.length === 0}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-lg outline-none transition focus:border-[#4a90e2] focus:ring-4 focus:ring-[#4a90e2]/15 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {isLoading
                ? "Loading volunteers..."
                : filteredVolunteers.length === 0
                  ? "No matching volunteers found"
                  : "Choose your name"}
            </option>
            {filteredVolunteers.map((volunteer) => (
              <option key={volunteer.id} value={volunteer.id}>
                {getVolunteerLabel(volunteer)}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        {statusMessage ? (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
              statusTone === "clock-out"
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              void handleClockAction(
                "/api/time-entries/clock-in",
                "Clocked in",
                "clock-in",
              )
            }
            disabled={!selectedVolunteerId || isSubmitting}
            className="w-full rounded-2xl bg-[#7a1c1c] px-6 py-4 text-2xl font-semibold text-white transition hover:bg-[#651616] disabled:cursor-not-allowed disabled:bg-[#7a1c1c]/50"
          >
            Clock In
          </button>

          <button
            type="button"
            onClick={() =>
              void handleClockAction(
                "/api/time-entries/clock-out",
                "Clocked out",
                "clock-out",
              )
            }
            disabled={!selectedVolunteerId || isSubmitting}
            className="w-full rounded-2xl bg-[#7a1c1c] px-6 py-4 text-2xl font-semibold text-white transition hover:bg-[#651616] disabled:cursor-not-allowed disabled:bg-[#7a1c1c]/50"
          >
            Clock Out
          </button>
        </div>
      </div>
    </main>
  );
}
