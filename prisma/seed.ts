import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding AI Lead Machine demo workspace...");

  const existingOrg = await prisma.organization.findFirst();
  if (existingOrg) {
    console.log("Workspace already has data, skipping duplicate seed.");
    return;
  }

  const organization = await prisma.organization.create({
    data: {
      name: "AI Lead Machine Demo Workspace",
      slug: "ai-lead-machine-demo",
      description: "A realistic demo workspace for real estate sales teams.",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Arjun Malhotra",
      email: "demo@aileadmachine.com",
      password: await bcrypt.hash("demo@1234", 10),
      organization: { connect: { id: organization.id } },
    },
  });

  const aarav = await prisma.lead.create({ data: { name: "Aarav Mehta", email: "aarav.mehta@demo.aileadmachine.com", phone: "+91 98765 41021", organizationId: organization.id, createdById: user.id, assignedToId: user.id, source: "PROPERTY_PORTAL", status: "QUALIFIED", propertyType: "Apartment", bedrooms: 2, bathrooms: 2, budget: 8500000, location: "Baner, Pune", timeline: "3 months", possession: "Ready to move", intent: "high", notes: "Interested in a family-friendly 2BHK close to schools and transit.", lastActivityAt: new Date() } });
  const priya = await prisma.lead.create({ data: { name: "Priya Sharma", email: "priya.sharma@demo.aileadmachine.com", phone: "+91 98204 77118", organizationId: organization.id, createdById: user.id, assignedToId: user.id, source: "WHATSAPP", status: "APPOINTMENT", propertyType: "Apartment", bedrooms: 3, bathrooms: 3, budget: 12000000, location: "Andheri West, Mumbai", timeline: "6 months", possession: "Under construction", intent: "high", notes: "Looking for a 3BHK family home with strong rental potential.", lastActivityAt: new Date() } });
  const rahul = await prisma.lead.create({ data: { name: "Rahul Sen", email: "rahul.sen@demo.aileadmachine.com", phone: "+91 98310 22409", organizationId: organization.id, createdById: user.id, assignedToId: user.id, source: "REFERRAL", status: "NEW", propertyType: "Apartment", bedrooms: 2, bathrooms: 2, budget: 7000000, location: "New Town, Kolkata", timeline: "1 year", intent: "medium", notes: "Exploring investment property options with a long-term view." } });
  const ananya = await prisma.lead.create({ data: { name: "Ananya Kapoor", email: "ananya.kapoor@demo.aileadmachine.com", phone: "+91 98190 66342", organizationId: organization.id, createdById: user.id, assignedToId: user.id, source: "GOOGLE_ADS", status: "CONTACTED", propertyType: "Apartment", bedrooms: 3, bathrooms: 3, budget: 15000000, location: "Kalyani Nagar, Pune", timeline: "3 months", possession: "Ready to move", intent: "high", notes: "Looking for a premium apartment with concierge amenities.", lastActivityAt: new Date() } });

  const modernApartment = await prisma.property.create({ data: { name: "Modern 2BHK Apartment", projectName: "Baner Heights", type: "Apartment", status: "AVAILABLE", location: "Baner, Pune", address: "Main Road, Baner", city: "Pune", state: "Maharashtra", price: 8500000, bedrooms: 2, bathrooms: 2, area: 1050, possessionStatus: "Ready to move", amenities: "Gym, clubhouse, covered parking", description: "A bright 2BHK apartment designed for comfortable family living.", availableUnits: 4, organizationId: organization.id } });
  const premiumResidence = await prisma.property.create({ data: { name: "Premium 3BHK Residence", projectName: "Kharadi Central", type: "Apartment", status: "AVAILABLE", location: "Kharadi, Pune", address: "EON Road, Kharadi", city: "Pune", state: "Maharashtra", price: 12500000, bedrooms: 3, bathrooms: 3, area: 1680, possessionStatus: "Under construction", amenities: "Pool, clubhouse, work lounge", description: "A premium 3BHK residence close to Pune's commercial corridor.", availableUnits: 7, organizationId: organization.id } });
  const villa = await prisma.property.create({ data: { name: "Luxury 4BHK Villa", projectName: "Whitefield Gardens", type: "Villa", status: "AVAILABLE", location: "Whitefield, Bengaluru", address: "Hope Farm Junction, Whitefield", city: "Bengaluru", state: "Karnataka", price: 24000000, bedrooms: 4, bathrooms: 4, area: 3200, possessionStatus: "Ready to move", amenities: "Private garden, smart home, parking", description: "A spacious independent villa for buyers seeking privacy and convenience.", availableUnits: 2, organizationId: organization.id } });
  const office = await prisma.property.create({ data: { name: "Commercial Office Space", projectName: "Hinjewadi Business Park", type: "Commercial", status: "AVAILABLE", location: "Hinjewadi, Pune", address: "Phase 1, Hinjewadi", city: "Pune", state: "Maharashtra", price: 18000000, area: 2400, possessionStatus: "Ready to move", amenities: "Reception, visitor parking, power backup", description: "A professionally managed office space for growing businesses.", availableUnits: 3, organizationId: organization.id } });

  await prisma.appointment.createMany({ data: [
    { date: new Date(Date.now() + 4 * 60 * 60 * 1000), duration: 60, status: "CONFIRMED", notes: "Property Visit — review layout, parking, and school access.", organizationId: organization.id, leadId: aarav.id, propertyId: modernApartment.id, assignedToId: user.id },
    { date: new Date(Date.now() + 24 * 60 * 60 * 1000), duration: 45, status: "SCHEDULED", notes: "Client Consultation — discuss 3BHK investment priorities.", organizationId: organization.id, leadId: priya.id, propertyId: premiumResidence.id, assignedToId: user.id },
    { date: new Date(Date.now() + 26 * 60 * 60 * 1000), duration: 60, status: "SCHEDULED", notes: "Site Visit — walk through premium residential project.", organizationId: organization.id, leadId: rahul.id, propertyId: villa.id, assignedToId: user.id },
  ] });

  console.log("Seeded realistic demo leads, appointments, and properties.");
  console.log("Demo access: demo@aileadmachine.com / demo@1234");
  void ananya;
  void office;
}

main().then(() => prisma.$disconnect()).catch(async (error) => {
  console.error("Error seeding AI Lead Machine:", error);
  await prisma.$disconnect();
  process.exit(1);
});
