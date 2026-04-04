import type {
    ClockInInput,
    ClockOutInput,
    TimeEntryRecord,
} from "@/lib/time-entries";


export const timeEntryQueryKey = ["time-entries"] as const;


// returns list of time entries
export async function fetchTimeEntries(volunteerId?: string) {
    const search = volunteerId
        ? `?volunteerId=${encodeURIComponent(volunteerId)}`
        : "";

    const response = await fetch(`/api/time-entries${search}`);
    const payload = (await response.json()) as {
        timeEntries?: TimeEntryRecord[];
        error?: string;
    };

    if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load time entries.");
    }

    return payload.timeEntries ?? [];
}

// Sends POST, creates a new time entry (clock in)
export async function clockInVolunteer(input: ClockInInput) {
    return requestTimeEntry("/api/time-entries/clock-in", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

// Sends POST, clocks out a volunteer
export async function clockOutVolunteer(input: ClockOutInput) {
    return requestTimeEntry("/api/time-entries/clock-out", {
        method: "POST",
        body: JSON.stringify(input),
    });
}



// validates a time entry
async function requestTimeEntry(url: string, init: RequestInit) {
    const response = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init.headers,
        },
    });

    const payload = (await response.json()) as {
        timeEntry?: TimeEntryRecord;
        error?: string;
    };

    if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save time entry.");
    }

    if (!payload.timeEntry) {
        throw new Error("Time entry response missing.");
    }

    return payload.timeEntry;
}