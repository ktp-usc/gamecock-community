import { jsonError, jsonErrorFromUnknown, readJson } from "@/lib/route-helpers";
import {
    deleteVolunteer,
    getVolunteer,
    updateVolunteer
} from "@/lib/server/volunteers";
import type { UpdateVolunteerInput } from "@/lib/volunteers";



export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const volunteer = await getVolunteer(id);
        return Response.json({ volunteer });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const input = await readJson<UpdateVolunteerInput>(request);

        if (!input) {
            return jsonError("Request body must be valid JSON.");
        }

        const volunteer = await updateVolunteer(id, input);
        return Response.json({ volunteer });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await deleteVolunteer(id);
        return Response.json({ success: true });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}
