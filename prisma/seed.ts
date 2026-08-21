import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding database...");

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
      email: "admin@demo.com",
      password: await bcrypt.hash("password123", 10),
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
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  });