
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/route-helpers";
import {ClockInInput, ClockOutInput} from "@/lib/time-entries";

export async function clockInVolunteer(input: ClockInInput) {
    // get the volunteer id
    const volunteerId = requireVolunteerId(input.volunteerId);

    //ensure the volunteer exists
    await ensureVolunteerExists(volunteerId);

    // finds the volunteer's open entry (if any)
    const openEntry = await prisma.timeEntry.findFirst({
        where: {
            volunteerId,
            clockOut: null,
        },
        orderBy: {
            clockIn: "desc",
        },
    });
    // If shift is already open, throw error
    if (openEntry) {
        throw new HttpError("Volunteer is already clocked in.", 400);
    }
    // creates new time entry
    return prisma.timeEntry.create({
        data: {
            volunteerId,
            clockIn: new Date(),
            clockOut: null,
        },
    });
}

export async function clockOutVolunteer(input: ClockOutInput) {
    // get the volunteer id
    const volunteerId = requireVolunteerId(input.volunteerId);

    // finds the volunteer's open entry
    const openEntry = await prisma.timeEntry.findFirst({
        where: {
            volunteerId,
            clockOut: null,
        },
        orderBy: {
            clockIn: "desc",
        },
    });
    // If there is no open time entry, throw error
    if (!openEntry) {
        throw new HttpError("No open time entry found.", 404);
    }
    // update the time entry with the clock out time
    return prisma.timeEntry.update({
        where: { id: openEntry.id },
        data: {
            clockOut: new Date(),
        },
    });
}

// lists all the time entries
export async function listTimeEntries(volunteerId?: string) {
    return prisma.timeEntry.findMany({
        where: volunteerId ? { volunteerId } : undefined,
        orderBy: {
            clockIn: "desc",
        },
    });
}

// require time entries to have a volunteer id
function requireVolunteerId(volunteerId: string) {
    const value = volunteerId.trim();

    if (!value) {
        throw new HttpError("volunteerId is required.", 400);
    }

    return value;
}

// verifies that a volunteer exists
async function ensureVolunteerExists(volunteerId: string) {
    const volunteer = await prisma.volunteer.findUnique({
        where: { id: volunteerId },
    });

    if (!volunteer) {
        throw new HttpError("Volunteer not found.", 404);
    }
}