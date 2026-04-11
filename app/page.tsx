"use client";

import { useEffect, useMemo, useState } from "react";

import type { VolunteerRecord } from "@/lib/api/volunteers";
import { isOpenTimeEntry, type TimeEntryRecord } from "@/lib/time-entries";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type VolunteerResponse = {
  volunteers?: VolunteerRecord[];
  error?: string;
};

type ClockResponse = {
  error?: string;
};

type TimeEntriesResponse = {
  timeEntries?: TimeEntryRecord[];
  error?: string;
};

type StatusTone = "clock-in" | "clock-out" | "";

const PAGE_PASSWORD = "gamecock2026";
const AUTH_KEY = "home-page-auth";

function getVolunteerLabel(volunteer: VolunteerRecord) {
  return `${volunteer.firstName} ${volunteer.lastName}`;
}

function PasswordScreen({
  password,
  setPassword,
  error,
  onSubmit,
}: {
  password: string;
  setPassword: (value: string) => void;
  error: string;
  onSubmit: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-[760px] rounded-[32px] bg-white px-10 py-12 shadow-2xl sm:px-12 sm:py-14">
        <h1 className="text-center text-4xl font-bold text-[#a61c1c] sm:text-5xl">
          Access Required
        </h1>
        <p className="mt-5 text-center text-lg text-neutral-600 sm:text-xl">
          Enter the password to access this page.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder="Password"
          className="mt-10 h-14 w-full rounded-2xl border border-neutral-300 px-5 text-lg outline-none transition focus:border-[#a61c1c] focus:ring-4 focus:ring-[#a61c1c]/10 sm:h-16 sm:text-xl"
        />

        {error ? (
          <p className="mt-4 text-sm font-medium text-[#a61c1c] sm:text-base">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          className="mt-8 h-14 w-full rounded-2xl bg-[#a61c1c] text-xl font-semibold text-white transition hover:bg-[#8f1616] sm:h-16 sm:text-2xl"
        >
          Enter
        </button>
      </div>
    </main>
  );
}

function HomeContent({ onLogout }: { onLogout: () => void }) {
  const [time, setTime] = useState("");
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClockStatus, setIsLoadingClockStatus] = useState(false);
  const [isSelectedVolunteerClockedIn, setIsSelectedVolunteerClockedIn] =
    useState<boolean | null>(null);
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

  const selectedVolunteer = useMemo(() => {
    return volunteers.find((volunteer) => volunteer.id === selectedVolunteerId);
  }, [selectedVolunteerId, volunteers]);

  useEffect(() => {
    if (!selectedVolunteerId) {
      setIsSelectedVolunteerClockedIn(null);
      setIsLoadingClockStatus(false);
      return;
    }

    let isCancelled = false;

    async function loadClockStatus() {
      try {
        setIsLoadingClockStatus(true);
        setError("");

        const response = await fetch(
          `/api/time-entries?volunteerId=${encodeURIComponent(selectedVolunteerId)}`,
        );
        const payload = (await response.json()) as TimeEntriesResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load clock status.");
        }

        if (!isCancelled) {
          setIsSelectedVolunteerClockedIn(
            (payload.timeEntries ?? []).some(isOpenTimeEntry),
          );
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load clock status.",
          );
          setIsSelectedVolunteerClockedIn(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingClockStatus(false);
        }
      }
    }

    void loadClockStatus();

    return () => {
      isCancelled = true;
    };
  }, [selectedVolunteerId]);

  const hasSelectedVolunteer = Boolean(selectedVolunteerId);
  const canClockIn =
    hasSelectedVolunteer &&
    isSelectedVolunteerClockedIn === false &&
    !isLoadingClockStatus &&
    !isSubmitting;
  const canClockOut =
    hasSelectedVolunteer &&
    isSelectedVolunteerClockedIn === true &&
    !isLoadingClockStatus &&
    !isSubmitting;

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
      setIsSelectedVolunteerClockedIn(tone === "clock-in");
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
    <>
      <button
        type="button"
        onClick={onLogout}
        className="fixed right-4 top-4 z-50 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-700"
      >
        Logout
      </button>

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
              htmlFor="volunteer-combobox"
              className="mb-3 block text-2xl font-semibold text-slate-950"
            >
              Select Your Name
            </label>

            <Combobox
              items={sortedVolunteers}
              value={selectedVolunteer ?? null}
              onValueChange={(volunteer) =>
                setSelectedVolunteerId(volunteer?.id ?? "")
              }
              itemToStringLabel={getVolunteerLabel}
              itemToStringValue={(volunteer) => volunteer.id}
              disabled={isLoading || sortedVolunteers.length === 0}
              name="volunteer"
              autoHighlight
            >
              <ComboboxInput
                id="volunteer-combobox"
                placeholder={
                  isLoading
                    ? "Loading volunteers..."
                    : "Search and choose your name"
                }
                aria-label="Select your name"
              />
              <ComboboxContent>
                <ComboboxEmpty>No matching volunteers found.</ComboboxEmpty>
                <ComboboxList>
                  {(volunteer) => (
                    <ComboboxItem key={volunteer.id} value={volunteer}>
                      {getVolunteerLabel(volunteer)}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
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
              disabled={!canClockIn}
              className="cursor-pointer w-full rounded-2xl bg-[#7a1c1c] px-6 py-4 text-2xl font-semibold text-white transition hover:bg-[#651616] disabled:cursor-not-allowed disabled:bg-[#7a1c1c]/50"
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
              disabled={!canClockOut}
              className="cursor-pointer w-full rounded-2xl bg-[#7a1c1c] px-6 py-4 text-2xl font-semibold text-white transition hover:bg-[#651616] disabled:cursor-not-allowed disabled:bg-[#7a1c1c]/50"
            >
              Clock Out
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedAuth = window.localStorage.getItem(AUTH_KEY);
    if (savedAuth === "true") {
      setAuthenticated(true);
    }
  }, []);

  function handleLogin() {
    if (password !== PAGE_PASSWORD) {
      setError("Incorrect password.");
      return;
    }

    window.localStorage.setItem(AUTH_KEY, "true");
    setAuthenticated(true);
    setError("");
    setPassword("");
  }

  function handleLogout() {
    window.localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setPassword("");
    setError("");
  }

  if (!authenticated) {
    return (
      <PasswordScreen
        password={password}
        setPassword={setPassword}
        error={error}
        onSubmit={handleLogin}
      />
    );
  }

  return <HomeContent onLogout={handleLogout} />;
}


