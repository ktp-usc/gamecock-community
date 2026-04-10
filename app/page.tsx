"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock3 } from "lucide-react";
import { toast } from "sonner";

import type { VolunteerRecord } from "@/lib/api/volunteers";
import { isOpenTimeEntry, type TimeEntryRecord } from "@/lib/time-entries";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";

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
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
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
    nextClockedInState: boolean,
  ) {
    if (!selectedVolunteerId) {
      return;
    }

    try {
      setIsSubmitting(true);

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

      toast.success(`${actionLabel}: ${volunteerName}`);
      setIsSelectedVolunteerClockedIn(nextClockedInState);
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save time entry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[#f4f4f4] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto mb-4 flex w-full max-w-3xl justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onLogout}
          className="rounded-2xl px-5"
        >
          Logout
        </Button>
      </div>

      <Card className="mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border-slate-200 bg-white text-center shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <CardHeader className="items-center gap-2 px-6 pt-7 sm:px-10 sm:pt-8">
          <CardTitle className="text-3xl text-[#7a1c1c] sm:text-4xl">
            Gamecock Community Shop
          </CardTitle>
          <p className="text-xl font-semibold text-slate-950 sm:text-3xl">
            Volunteer Clock-In
          </p>
          <CardDescription className="mx-auto max-w-xl text-center text-sm leading-6 text-slate-600 sm:text-base">
            Select your name, then clock in or clock out for your shift.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 py-6 sm:px-10 sm:py-8">
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm">
              <Clock3 className="size-4 text-[#7a1c1c]" />
              Current Time
            </div>
            <div className="mt-2 text-4xl font-light tracking-tight text-slate-950 sm:text-5xl">
              {time || "--:--:--"}
            </div>
          </div>

          <Separator />

          <div className="text-left">
            <label
              htmlFor="volunteer-combobox"
              className="mb-3 block text-lg font-semibold text-slate-950 sm:text-xl"
            >
              Select Your Name
            </label>
            <p className="mb-4 text-sm leading-6 text-slate-600">
              Start typing to search for your record, then choose your name from the list.
            </p>

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
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="size-4" />
              <AlertTitle>Unable to continue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              type="button"
              size="lg"
              onClick={() =>
                void handleClockAction(
                  "/api/time-entries/clock-in",
                  "Clocked in",
                  true,
                )
              }
              disabled={!canClockIn}
              className="h-16 w-full min-w-0 rounded-[24px] bg-[#7a1c1c] text-xl font-semibold text-white shadow-[0_14px_28px_rgba(122,28,28,0.16)] hover:bg-[#651616]"
            >
              {isSubmitting ? "Saving..." : "Clock In"}
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={() =>
                void handleClockAction(
                  "/api/time-entries/clock-out",
                  "Clocked out",
                  false,
                )
              }
              disabled={!canClockOut}
              className="h-16 w-full min-w-0 rounded-[24px] border border-slate-300 bg-white text-xl font-semibold text-slate-950 shadow-sm hover:bg-slate-50"
            >
              {isSubmitting ? "Saving..." : "Clock Out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
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
