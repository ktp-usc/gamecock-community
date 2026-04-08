import { jsonErrorFromUnknown, readJson } from "@/lib/route-helpers";
import { clockOutVolunteer } from "@/lib/server/time-entries";
import type { ClockOutInput } from "@/lib/time-entries";

export async function POST(request: Request) {
    try {
        const input = await readJson<ClockOutInput>(request);

        if (!input) {
            return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const timeEntry = await clockOutVolunteer(input);
        return Response.json({ timeEntry });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}
