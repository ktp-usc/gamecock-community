"use client";

import { useEffect, useState } from "react";

type ActionState = "idle" | "clocked-in" | "clocked-out";

type ActiveSession = {
  name: string;
  clockInTime: string;
};

const ACTIVE_SESSIONS_KEY = "gcs-active-sessions";

export default function Home() {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionTime, setActionTime] = useState("");
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    setMounted(true);
    setTime(new Date().toLocaleTimeString());

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    const storedSessions = window.localStorage.getItem(ACTIVE_SESSIONS_KEY);
    if (storedSessions) {
      try {
        setActiveSessions(JSON.parse(storedSessions) as ActiveSession[]);
      } catch {
        window.localStorage.removeItem(ACTIVE_SESSIONS_KEY);
      }
    }

    return () => clearInterval(interval);
  }, []);

  function saveActiveSessions(sessions: ActiveSession[]) {
    setActiveSessions(sessions);
    window.localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
  }

  function handleClockIn() {
    if (!selectedName) return;

    const alreadyClockedIn = activeSessions.some(
      (session) => session.name === selectedName
    );

    if (alreadyClockedIn) return;

    const now = new Date().toLocaleTimeString();

    const updatedSessions = [
      ...activeSessions,
      {
        name: selectedName,
        clockInTime: now,
      },
    ];

    saveActiveSessions(updatedSessions);
    setActionTime(now);
    setActionState("clocked-in");
  }

  function handleClockOut() {
    if (!selectedName) return;

    const matchingSession = activeSessions.find(
      (session) => session.name === selectedName
    );

    if (!matchingSession) return;

    const now = new Date().toLocaleTimeString();

    const updatedSessions = activeSessions.filter(
      (session) => session.name !== selectedName
    );

    saveActiveSessions(updatedSessions);
    setActionTime(now);
    setActionState("clocked-out");
  }

  function handleReturnHome() {
    setActionState("idle");
    setActionTime("");
    setSelectedName("");
  }

  const canClockIn =
    Boolean(selectedName) &&
    !activeSessions.some((session) => session.name === selectedName);

  const canClockOut =
    Boolean(selectedName) &&
    activeSessions.some((session) => session.name === selectedName);

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f4f4f4] px-4 pt-20">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-12 text-center shadow-lg">
        {actionState === "idle" ? (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-[#7a1c1c] sm:text-3xl">
              Gamecock Community Shop
            </h1>

            <h2 className="mb-2 text-lg sm:text-xl">Volunteer Clock-In</h2>

            <div className="mb-2 min-h-[48px] text-4xl">
              {mounted ? time : " "}
            </div>

            <hr className="my-5" />

            <label className="mb-2 block text-lg">Select Your Name</label>

            <select
              className="mb-6 w-full cursor-pointer rounded-lg border p-3 text-base"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              <option value="">Select your name</option>
              <option value="John Doe">John Doe</option>
              <option value="Jane Smith">Jane Smith</option>
            </select>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleClockIn}
                disabled={!canClockIn}
                className={`w-1/2 rounded-lg py-3 text-white transition ${
                  canClockIn
                    ? "cursor-pointer bg-[#7a1c1c] hover:bg-[#651616]"
                    : "cursor-not-allowed bg-[#7a1c1c]/50"
                }`}
              >
                Clock In
              </button>

              <button
                type="button"
                onClick={handleClockOut}
                disabled={!canClockOut}
                className={`w-1/2 rounded-lg py-3 text-white transition ${
                  canClockOut
                    ? "cursor-pointer bg-[#7a1c1c] hover:bg-[#651616]"
                    : "cursor-not-allowed bg-[#7a1c1c]/50"
                }`}
              >
                Clock Out
              </button>
            </div>
          </>
        ) : (
          <div className="py-8">
            <div className="mb-4 text-4xl">✅</div>

            <h1 className="mb-3 text-2xl font-semibold text-[#7a1c1c] sm:text-3xl">
              {actionState === "clocked-in"
                ? "Successfully Clocked In"
                : "Successfully Clocked Out"}
            </h1>

            <p className="mb-2 text-lg font-semibold">{selectedName}</p>

            <p className="mb-2 text-base text-neutral-700">
              {actionState === "clocked-in"
                ? `Clocked in at ${actionTime}`
                : `Clocked out at ${actionTime}`}
            </p>

            <button
              type="button"
              onClick={handleReturnHome}
              className="mt-6 rounded-lg bg-[#7a1c1c] px-6 py-3 text-white transition hover:bg-[#651616]"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
