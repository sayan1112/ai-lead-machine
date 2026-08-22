import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Create direct database connection for seeding (uses SQLite for local dev)
const adapter = new PrismaBetterSqlite3({
  url: "./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Check if organization already exists
  const existingOrg = await prisma.organization.findFirst();
  
  if (existingOrg) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: "Demo Organization",
      slug: "demo-org",
      description: "This is a demo organization for the AI Lead Machine.",
    },
  });

  // Create users
  const user = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      organization: { connect: { id: org.id } },
    },
  });

  // Seed leads
  await prisma.lead.createMany({
    data: [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        organizationId: org.id,
        source: "WEBSITE",
        status: "CONTACTED",
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        organizationId: org.id,
        source: "INSTAGRAM",
        status: "QUALIFIED",
      },
    ],
  });

  console.log("Database has been seeded.");
  console.log("Login credentials: admin@example.com / admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
