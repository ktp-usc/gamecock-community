"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth/client";
import type { VolunteerRecord } from "@/lib/api/volunteers";
import type { TimeEntryRecord } from "@/lib/time-entries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminPageClientProps = {
  adminEmail: string;
  initialAuthenticated: boolean;
};

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

const PAGE_SIZE = 12;

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  }).format(date);
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatHours(startISO: string, endISO: string) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const totalMinutes = Math.max(0, Math.round((end - start) / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export default function AdminPageClient({
  adminEmail,
  initialAuthenticated,
}: AdminPageClientProps) {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [entries, setEntries] = useState<VolunteerLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingVolunteer, setIsAddingVolunteer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newVolunteerName, setNewVolunteerName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const currentMonthYear = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  async function refreshEntries() {
    try {
      setIsRefreshing(true);
      setError("");

      const [volunteersResponse, timeEntriesResponse] = await Promise.all([
        fetch("/api/volunteers", {
          method: "GET",
          cache: "no-store",
        }),
        fetch("/api/time-entries", {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      const volunteersPayload =
        (await volunteersResponse.json()) as VolunteersResponse;
      const timeEntriesPayload =
        (await timeEntriesResponse.json()) as TimeEntriesResponse;

      if (!volunteersResponse.ok) {
        setEntries([]);
        setError(volunteersPayload.error ?? "Unable to load volunteers.");
        return;
      }

      if (!timeEntriesResponse.ok) {
        setEntries([]);
        setError(timeEntriesPayload.error ?? "Unable to load time entries.");
        return;
      }

      const volunteerMap = new Map(
        (volunteersPayload.volunteers ?? []).map((volunteer) => [
          volunteer.id,
          `${volunteer.firstName} ${volunteer.lastName}`.trim(),
        ]),
      );

      const nextEntries: VolunteerLogEntry[] = (timeEntriesPayload.timeEntries ?? [])
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
            totalHours:
              clockOutDate && entry.clockOut
                ? formatHours(entry.clockIn, entry.clockOut)
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
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      void refreshEntries();
      return;
    }

    setEntries([]);
  }, [authenticated]);

  async function handleLogin() {
    try {
      setIsSubmitting(true);
      setError("");

      if (!adminEmail) {
        toast.error("Admin email is not configured.");
        return;
      }

      const result = await authClient.signIn.email({
        email: adminEmail,
        password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Unable to sign in.");
        return;
      }

      setAuthenticated(true);
      setPassword("");
      await refreshEntries();
    } catch {
      toast.error("Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      setIsSubmitting(true);
      setError("");

      const result = await authClient.signOut();

      if (result.error) {
        setError(result.error.message ?? "Unable to log out.");
        return;
      }

      setAuthenticated(false);
      setEntries([]);
      setPassword("");
      setSearch("");
      setShowModal(false);
      setNewVolunteerName("");
    } catch {
      setError("Unable to log out.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddVolunteer() {
    try {
      setIsAddingVolunteer(true);
      setError("");

      const fullName = newVolunteerName.trim();

      if (!fullName) {
        setError("Please enter a volunteer name.");
        return;
      }

      const parts = fullName.split(/\s+/);
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");

      if (!lastName) {
        setError("Please enter a first and last name.");
        return;
      }

      const response = await fetch("/api/volunteers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setError(payload?.error ?? "Failed to add volunteer.");
        return;
      }

      setNewVolunteerName("");
      setShowModal(false);
      await refreshEntries();
    } catch {
      setError("Failed to add volunteer.");
    } finally {
      setIsAddingVolunteer(false);
    }
  }

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return entries;
    }

    return entries.filter((entry) => entry.name.toLowerCase().includes(query));
  }, [entries, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedEntries = useMemo(() => {
    const startIndex = (activePage - 1) * PAGE_SIZE;
    return filteredEntries.slice(startIndex, startIndex + PAGE_SIZE);
  }, [activePage, filteredEntries]);

  if (!authenticated) {
    return (
      <main className="bg-[#f4f4f4] px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
        <Card className="mx-auto w-full max-w-xl rounded-[28px] border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <CardHeader className="items-center gap-2 px-6 pt-7 text-center sm:px-10 sm:pt-8">
            <CardTitle className="text-3xl text-[#7a1c1c] sm:text-4xl">
              Admin Access
            </CardTitle>
            <CardDescription className="mx-auto max-w-md text-base leading-7 text-slate-600">
              Enter the admin password to review volunteer activity and manage
              records.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-7 pt-1 sm:px-10 sm:pb-8 sm:pt-2">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleLogin();
              }}
            >
              <div className="space-y-2 text-left">
                <label
                  htmlFor="admin-password"
                  className="text-sm font-semibold text-slate-900"
                >
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  className="h-12 rounded-2xl border-slate-300 bg-white px-4 text-base shadow-none focus-visible:border-[#7a1c1c] focus-visible:ring-[#7a1c1c]/15"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-2xl bg-[#7a1c1c] text-base font-semibold text-white hover:bg-[#651616] disabled:bg-[#7a1c1c]/70"
              >
                {isSubmitting ? "Checking..." : "Enter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="bg-[#f4f4f4] px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
      <Card className="mx-auto w-full max-w-6xl rounded-[28px] border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <CardHeader className="px-6 pt-6 sm:px-10 sm:pt-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl text-[#7a1c1c] sm:text-4xl">
                Volunteer Time Log
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
                Search recent entries, review volunteer hours, and add new
                volunteers when needed.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => void refreshEntries()}
                disabled={isRefreshing}
                className="h-11 rounded-2xl border-slate-300 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <RefreshCw
                  className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleLogout()}
                disabled={isSubmitting}
                className="h-11 rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-700 shadow-sm hover:bg-slate-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-7 sm:px-10 sm:pb-8">
          {error ? (
            <Alert variant="destructive" className="border-red-200 text-left">
              <AlertCircle className="size-4" />
              <AlertTitle>Unable to continue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Separator />

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {currentMonthYear}
          </p>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="w-full max-w-md space-y-2">
                  <label
                    htmlFor="volunteer-search"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Search volunteer name
                  </label>
                  <Input
                    id="volunteer-search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Type a volunteer name"
                    className="h-11 rounded-2xl border-slate-300 bg-white px-4 text-base shadow-none focus-visible:border-[#7a1c1c] focus-visible:ring-[#7a1c1c]/15"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="h-11 rounded-2xl bg-[#7a1c1c] px-5 text-base font-semibold text-white hover:bg-[#651616]"
                >
                  <Plus className="size-4" />
                  Add Volunteer
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-[#7a1c1c] [&_tr]:border-0">
                <TableRow className="hover:bg-[#7a1c1c]">
                  <TableHead className="h-12 px-4 text-sm font-semibold text-white">
                    Name
                  </TableHead>
                  <TableHead className="h-12 px-4 text-sm font-semibold text-white">
                    Date
                  </TableHead>
                  <TableHead className="h-12 px-4 text-sm font-semibold text-white">
                    Clock In
                  </TableHead>
                  <TableHead className="h-12 px-4 text-sm font-semibold text-white">
                    Clock Out
                  </TableHead>
                  <TableHead className="h-12 px-4 text-sm font-semibold text-white">
                    Total Hours
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.length === 0 ? (
                  <TableRow className="border-slate-200 hover:bg-white">
                    <TableCell
                      colSpan={5}
                      className="px-4 py-12 text-center text-base text-slate-500"
                    >
                      No volunteer entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEntries.map((entry, index) => (
                    <TableRow
                      key={entry.id}
                      className={`border-slate-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/80"
                      } hover:bg-slate-100/70`}
                    >
                      <TableCell className="px-4 py-4 font-medium text-slate-900">
                        {entry.name}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-700">
                        {entry.dateLabel}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-700">
                        {entry.clockInLabel}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-700">
                        {entry.clockOutLabel || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-medium text-slate-700">
                        {entry.totalHours || "In progress"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-slate-600">
                {filteredEntries.length === 0
                  ? "Showing 0 entries"
                  : `Showing ${(activePage - 1) * PAGE_SIZE + 1}-${Math.min(
                      activePage * PAGE_SIZE,
                      filteredEntries.length,
                    )} of ${filteredEntries.length} entries`}
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={activePage === 1}
                  className="h-10 rounded-xl border-slate-300 bg-white px-3 text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <span className="min-w-20 text-center text-sm font-medium text-slate-700">
                  Page {activePage} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={activePage === totalPages}
                  className="h-10 rounded-xl border-slate-300 bg-white px-3 text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="w-full max-w-md rounded-[28px] border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
            <CardHeader className="gap-2 px-6 pt-6">
              <CardTitle className="text-2xl text-[#7a1c1c]">
                Add New Volunteer
              </CardTitle>
              <CardDescription className="text-base leading-7 text-slate-600">
                Enter the volunteer&apos;s first and last name to create a new
                record.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-5">
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleAddVolunteer();
                }}
              >
                <div className="space-y-2 text-left">
                  <label
                    htmlFor="new-volunteer"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Volunteer name
                  </label>
                  <Input
                    id="new-volunteer"
                    value={newVolunteerName}
                    onChange={(event) => setNewVolunteerName(event.target.value)}
                    placeholder="First and last name"
                    className="h-12 rounded-2xl border-slate-300 bg-white px-4 text-base shadow-none focus-visible:border-[#7a1c1c] focus-visible:ring-[#7a1c1c]/15"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setNewVolunteerName("");
                    }}
                    disabled={isAddingVolunteer}
                    className="h-11 rounded-2xl border-slate-300 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAddingVolunteer}
                    className="h-11 rounded-2xl bg-[#7a1c1c] px-4 text-base font-semibold text-white hover:bg-[#651616] disabled:bg-[#7a1c1c]/70"
                  >
                    {isAddingVolunteer ? "Adding..." : "Add Volunteer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
