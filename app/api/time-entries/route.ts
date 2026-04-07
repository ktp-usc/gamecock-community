import { jsonErrorFromUnknown, optionalString } from "@/lib/route-helpers";
import { listTimeEntries } from "@/lib/server/time-entries";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const volunteerId = optionalString(searchParams.get("volunteerId"));
        const timeEntries = await listTimeEntries(volunteerId ?? undefined);

        return Response.json({ timeEntries });
    } catch (error) {
        return jsonErrorFromUnknown(error);
    }
}
