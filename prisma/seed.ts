import { PrismaClient } from '@prisma/client'
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// This file adds sample data to the database

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter })

async function main() {
    await prisma.volunteer.create({
        data: {
            id: "test-id",
            firstName: "Test",
            lastName: "User"
        }
    })
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });