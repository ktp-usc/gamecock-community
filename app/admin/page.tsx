"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import {
  ADMIN_AUTH_KEY,
  ADMIN_PASSWORD,
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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });
  const [entries, setEntries] = useState<VolunteerLogEntry[]>(() => {
    if (typeof window === "undefined") return [];
    return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true"
      ? loadEntries().slice().reverse()
      : [];
  });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  function refreshEntries() {
    setEntries(loadEntries().slice().reverse());
  }

  function handleLogin(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (password !== ADMIN_PASSWORD) {
      setError("Incorrect password.");
      return;
    }

    window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
    setAuthenticated(true);
    setError("");
    refreshEntries();
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

              <form className="space-y-5 text-left" onSubmit={handleLogin}>
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
                  onChange={(e) => setPassword(e.target.value)}
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
                  className="h-14 w-full rounded-2xl bg-[#a61c1c] text-lg font-semibold text-white hover:bg-[#8f1616]"
                >
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f4f4f4] px-4 py-10 text-neutral-900 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <Card className="w-full overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <CardHeader className="items-center gap-2 text-center">
            <CardTitle className="text-3xl font-semibold tracking-tight text-[#7a1c1c] sm:text-4xl">
              Volunteer Time Log
            </CardTitle>
            <CardDescription className="text-base leading-7 text-neutral-600">
              Search and review volunteer time entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-8 sm:px-10">
            <Separator />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search volunteer name"
                  className="h-12 rounded-2xl pl-10"
                />
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
  );
}
