import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { HttpError, requireNonEmptyString } from "@/lib/route-helpers";
import {CreateVolunteerInput, UpdateVolunteerInput} from "@/lib/volunteers";

const volunteerOrderBy = {
    lastName: "asc"
} satisfies Prisma.VolunteerOrderByWithRelationInput;

// Returns all volunteers ordered by the date they were added
export async function listVolunteers() {
    return prisma.volunteer.findMany({
        orderBy: volunteerOrderBy
    });
}

// Returns a volunteer using ID
export async function getVolunteer(id: string) {
    const volunteer = await prisma.volunteer.findUnique({
        where: { id }
    });

    if (!volunteer) {
        throw new HttpError("Volunteer not found.", 404);
    }

    return volunteer;
}

// validates input, then insert new volunteer into database
export async function createVolunteer(input: CreateVolunteerInput) {
    return prisma.volunteer.create({
        data: validateCreateVolunteerInput(input)
    });
}

// validates input, updates a volunteer record
export async function updateVolunteer(id: string, input: UpdateVolunteerInput) {
    try {
        return await prisma.volunteer.update({
            where: { id },
            data: validateUpdateVolunteerInput(input)
        });
    } catch (error) {
        if (isRecordNotFoundError(error)) {
            throw new HttpError("Volunteer not found.", 404);
        }

        throw error;
    }
}

// deletes a volunteer by ID
export async function deleteVolunteer(id: string) {
    try {
        await prisma.volunteer.delete({
            where: { id }
        });
    } catch (error) {
        if (isRecordNotFoundError(error)) {
            throw new HttpError("Volunteer not found.", 404);
        }

        throw error;
    }
}

// validates the create fields
function validateCreateVolunteerInput(input: Prisma.VolunteerCreateInput) {
    const errors: string[] = [];
    const firstName = requireNonEmptyString(input.firstName, "firstName", errors);
    const lastName = requireNonEmptyString(input.lastName, "lastName", errors);

    if (errors.length > 0 || !firstName || !lastName ) {
        throw new HttpError(errors.join(" "), 400);
    }

    return {
        firstName,
        lastName
    };
}

// validates the update fields
function validateUpdateVolunteerInput(input: Prisma.VolunteerUpdateInput) {
    const errors: string[] = [];
    const updates: {
        firstName?: string;
        lastName?: string;
    } = {};

    if (input.lastName !== undefined) {
        if (typeof input.lastName === "string" && input.lastName.trim().length > 0) {
            updates.lastName = input.lastName.trim();
        } else if (typeof input.lastName !== "string") {
            errors.push("lastName must be a string.");
        }
    }

    if (input.firstName !== undefined) {
        if (typeof input.firstName === "string" && input.firstName.trim().length > 0) {
            updates.firstName = input.firstName.trim();
        } else if (typeof input.firstName !== "string") {
            errors.push("firstName must be a string.");
        }
    }

    if (errors.length > 0) {
        throw new HttpError(errors.join(" "), 400);
    }

    if (Object.keys(updates).length === 0) {
        throw new HttpError("Send at least one field to update.", 400);
    }

    return updates;
}

function isRecordNotFoundError(error: unknown) {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
    );
}
