import "dotenv/config";

import { readFile } from "node:fs/promises";
import * as path from "node:path";

import { prisma } from "../lib/prisma";
import { createVolunteer, listVolunteers } from "../lib/server/volunteers";
import type { VolunteerRecord } from "../lib/api/volunteers";

const csvPath = path.join(process.cwd(), "scripts", "Volunteer_Names_Cleaned.csv");

type CsvVolunteerRow = {
  firstName: string;
  lastName: string;
};

function normalizeNamePart(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toVolunteerKey(firstName: string, lastName: string) {
  return `${firstName.toLowerCase()}|${lastName.toLowerCase()}`;
}

function parseCsvRows(contents: string) {
  const lines = contents
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(1).map((line) => {
    const [firstName = "", lastName = ""] = line.split(",", 2);

    return {
      firstName: normalizeNamePart(firstName),
      lastName: normalizeNamePart(lastName),
    };
  });
}

async function main() {
  const rawCsv = await readFile(csvPath, "utf8");
  const csvRows = parseCsvRows(rawCsv);
  const existingVolunteers = await listVolunteers();
  const knownVolunteerKeys = new Set(
    existingVolunteers.map((volunteer: VolunteerRecord) =>
      toVolunteerKey(volunteer.firstName, volunteer.lastName),
    ),
  );

  let insertedCount = 0;
  let skippedBlankCount = 0;
  let skippedDuplicateCount = 0;

  for (const row of csvRows) {
    const volunteer: CsvVolunteerRow = {
      firstName: row.firstName,
      lastName: row.lastName,
    };

    if (!volunteer.firstName || !volunteer.lastName) {
      skippedBlankCount += 1;
      continue;
    }

    const volunteerKey = toVolunteerKey(
      volunteer.firstName,
      volunteer.lastName,
    );

    if (knownVolunteerKeys.has(volunteerKey)) {
      skippedDuplicateCount += 1;
      continue;
    }

    await createVolunteer(volunteer);
    knownVolunteerKeys.add(volunteerKey);
    insertedCount += 1;
  }

  console.log(`Processed ${csvRows.length} CSV rows.`);
  console.log(`Inserted ${insertedCount} volunteers.`);
  console.log(`Skipped ${skippedDuplicateCount} duplicates.`);
  console.log(`Skipped ${skippedBlankCount} blank rows.`);
}

main()
  .catch((error) => {
    console.error("Volunteer import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
