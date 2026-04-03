
import type { VolunteerRecord } from "@/lib/api/volunteers";

export type VolunteerDraft = {
    firstName: string;
    lastName: string;
};

export function createEmptyVolunteerDraft(): VolunteerDraft {
    return {
        firstName: "",
        lastName: ""
    };
}

export function volunteerToDraft(volunteer: VolunteerRecord): VolunteerDraft {
    return {
        firstName: volunteer.firstName,
        lastName: volunteer.lastName
    };
}

export type CreateVolunteerInput = {
    firstName: string;
    lastName: string;
};

export type UpdateVolunteerInput = {
    firstName?: string;
    lastName?: string;
};