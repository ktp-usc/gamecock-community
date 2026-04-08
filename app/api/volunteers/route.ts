import { jsonError, jsonErrorFromUnknown, readJson } from "@/lib/route-helpers";
import { createVolunteer, listVolunteers } from "@/lib/server/volunteers";
import type { CreateVolunteerInput } from "@/lib/volunteers";

export async function GET() {
    try {
        const volunteers = await listVolunteers();
        return Response.json({ volunteers });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}

export async function POST(request: Request) {
    try {
        const input = await readJson<CreateVolunteerInput>(request);

        if (!input) {
            return jsonError("Request body must be valid JSON.");
        }

        const volunteer = await createVolunteer(input);
        return Response.json({ volunteer }, { status: 201 });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}
