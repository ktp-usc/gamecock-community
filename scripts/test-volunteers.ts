import "dotenv/config";
import {
    createVolunteer,
    listVolunteers,
    updateVolunteer
} from "@/lib/server/volunteers";


async function main() {
    console.log("Creating volunteer...");
    const volunteer = await createVolunteer({
        firstName: "Test",
        lastName: "Volunteer",
    });
    console.log("Created:", volunteer);

    console.log("Listing volunteers...");
    const volunteers = await listVolunteers();
    console.log("Count:", volunteers.length);

    console.log("Updating volunteer...");
    const updatedVolunteer = await updateVolunteer(volunteer.id, {
        firstName: "Updated",
    });
    console.log("Updated:", updatedVolunteer);

}

main()
    .catch((error) => {
        console.error("Test script failed:", error);
        process.exitCode = 1;
    });