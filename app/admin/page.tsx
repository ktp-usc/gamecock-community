"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, Search } from "lucide-react";

import {
  ADMIN_AUTH_KEY,
  loadEntries,
  type VolunteerLogEntry,
} from "@/lib/volunteer-log";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  }).format(new Date());

  function refreshEntries() {
    setEntries(loadEntries().slice().reverse());
  }

  useEffect(() => {
    const isAuthed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";

    setAuthenticated(isAuthed);
    if (isAuthed) {
      refreshEntries();
    }
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
    setEntries([]);
    setPassword("");
    setSearch("");
    setError("");
  }

  function handleCloseModal() {
    setShowModal(false);
    setNewVolunteerName("");
  }

  async function handleAddVolunteer() {
    const fullName = newVolunteerName.trim();

    if (!fullName) {
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
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Failed to add volunteer.");
      return;
    }

    setError("");
    handleCloseModal();
  }

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return entries;
    }

    return entries.filter((entry) => entry.name.toLowerCase().includes(query));
  }, [entries, search]);

  if (!authenticated) {
    return (
      <main className="bg-[#f4f4f4] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-2xl">
          <Card className="w-full overflow-hidden rounded-[28px] border-slate-200 bg-white text-neutral-900 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <CardHeader className="items-center gap-2 px-6 text-center sm:px-10">
              <CardTitle className="text-3xl font-semibold text-[#7a1c1c] sm:text-4xl">
                Admin Access
              </CardTitle>
              <CardDescription className="mx-auto max-w-md text-center text-base leading-7 text-neutral-600">
                Enter the admin password to view the volunteer log.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8 sm:px-10">
              <Separator />

              <form
                className="space-y-5 text-left"
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  void handleLogin();
                }}
              >
                <label
                  htmlFor="admin-password"
                  className="block text-lg font-semibold text-slate-950"
                >
                  Password
                </label>

                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="h-14 rounded-2xl px-5 text-lg"
                />

                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Login failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-2xl bg-[#a61c1c] text-lg font-semibold text-white hover:bg-[#8f1616] disabled:cursor-not-allowed disabled:bg-[#a61c1c]/60"
                >
                  {isSubmitting ? "Checking..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="bg-[#f4f4f4] px-4 py-10 text-neutral-900 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-5xl">
          <Card className="w-full overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <CardHeader className="items-center gap-2 text-center">
              <CardTitle className="text-3xl font-semibold tracking-tight text-[#7a1c1c] sm:text-4xl">
                Volunteer Time Log
              </CardTitle>
              <CardDescription className="text-base leading-7 text-neutral-600">
                {currentDate}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8 sm:px-10">
              <Separator />

              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Action needed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search volunteer name"
                      className="h-12 rounded-2xl pl-10"
                    />
                  </div>

                  <Button
                    onClick={() => setShowModal(true)}
                    className="rounded-2xl bg-[#a61c1c] text-white hover:bg-[#8f1616]"
                  >
                    Add New Volunteer
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={refreshEntries}
                    className="rounded-2xl"
                  >
                    Refresh
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="rounded-2xl bg-[#a61c1c] text-white hover:bg-[#8f1616]"
                  >
                    Logout
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-[#a61c1c]">
                    <TableRow className="border-b border-[#8f1616] hover:bg-transparent">
                      <TableHead className="px-6 py-4 font-semibold text-white">
                        Name
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-white">
                        Date
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-white">
                        Clock In
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-white">
                        Clock Out
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-white">
                        Total Hours
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="px-6 py-10 text-center text-lg text-neutral-500"
                        >
                          No volunteer entries yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id} className="bg-white odd:bg-[#f7f7f7]">
                          <TableCell className="px-6 py-4">{entry.name}</TableCell>
                          <TableCell className="px-6 py-4">
                            {entry.dateLabel}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {entry.clockInLabel}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {entry.clockOutLabel || "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {entry.totalHours || "In progress"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-md rounded-[28px] border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-[#7a1c1c]">
                Add New Volunteer
              </CardTitle>
              <CardDescription>
                Enter the volunteer&apos;s name to create a new record.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="new-volunteer-name"
                  className="block text-sm font-medium text-slate-900"
                >
                  Volunteer Name
                </label>
                <Input
                  id="new-volunteer-name"
                  value={newVolunteerName}
                  onChange={(event) => setNewVolunteerName(event.target.value)}
                  placeholder="Volunteer name"
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleAddVolunteer()}
                  className="rounded-2xl bg-[#a61c1c] text-white hover:bg-[#8f1616]"
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
