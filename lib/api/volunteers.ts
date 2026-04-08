import type {
    CreateVolunteerInput,
    UpdateVolunteerInput
} from "@/lib/volunteers";

export type VolunteerRecord = {
    id: string;
    firstName: string;
    lastName: string;
};

export const volunteersQueryKey = ["volunteers"] as const;

// returns list of volunteers
export async function fetchVolunteers() {
    const response = await fetch("/api/volunteers");
    const payload = (await response.json()) as {
        volunteers?: VolunteerRecord[];
        error?: string;
    };

    if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load volunteers.");
    }

    return payload.volunteers ?? [];
}

// Sends POST, creates a new volunteer
export async function createVolunteer(input: CreateVolunteerInput) {
    return requestVolunteer("/api/volunteers", {
        method: "POST",
        body: JSON.stringify(input)
    });
}

// Sends PATCH, updates a volunteer
export async function updateVolunteer(id: string, input: UpdateVolunteerInput) {
    return requestVolunteer(`/api/volunteers/${ id }`, {
        method: "PATCH",
        body: JSON.stringify(input)
    });
}

// validates a volunteer entry
async function requestVolunteer(url: string, init: RequestInit) {
    const response = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init.headers
        }
    });

    const payload = (await response.json()) as {
        volunteer?: VolunteerRecord;
        error?: string;
    };

    if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save volunteer.");
    }

    if (!payload.volunteer) {
        throw new Error("Volunteer response missing.");
    }

    return payload.volunteer;
}
