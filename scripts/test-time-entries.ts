import "dotenv/config";

import {
    clockInVolunteer,
    clockOutVolunteer,
    listTimeEntries,
} from "@/lib/server/time-entries";

async function main() {
    const volunteerId = "abd8fbd4-6ed5-455d-b198-388d4bbf85ed";

    console.log(await clockInVolunteer({ volunteerId }));
    console.log(await listTimeEntries(volunteerId));
    console.log(await clockOutVolunteer({ volunteerId }));
    console.log(await listTimeEntries(volunteerId));
}

main().catch(console.error);