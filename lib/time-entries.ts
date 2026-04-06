
export type TimeEntryRecord = {
    id: string;
    volunteerId: string;
    clockIn: string;
    clockOut: string | null;
};


export type ClockInInput = {
    volunteerId: string;
};

export type ClockOutInput = {
    volunteerId: string;
};

export function isOpenTimeEntry(entry: TimeEntryRecord) {
    return entry.clockOut === null;
}

// displays the duration
export function getTimeEntryDurationHours(entry: TimeEntryRecord) {
    if (!entry.clockOut) return null;

    const start = new Date(entry.clockIn).getTime();
    const end = new Date(entry.clockOut).getTime();
    return Math.max(0, (end - start) / 3_600_000);
}