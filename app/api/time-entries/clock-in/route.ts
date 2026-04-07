import { jsonErrorFromUnknown, readJson } from "@/lib/route-helpers";
import { clockInVolunteer } from "@/lib/server/time-entries";
import type { ClockInInput } from "@/lib/time-entries";

export async function POST(request: Request) {
    try {
        const input = await readJson<ClockInInput>(request);

        if (!input) {
            return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
        }

        const timeEntry = await clockInVolunteer(input);
        return Response.json({ timeEntry }, { status: 201 });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}
