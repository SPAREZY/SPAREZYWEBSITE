import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function ago(hours: number): Date {
  return new Date(Date.now() - hours * 3_600_000);
}

async function main() {
  await prisma.quote.deleteMany();
  await prisma.partRequest.deleteMany();

  const year = new Date().getFullYear();
  let seq = 0;
  const id = () => `SPZ-${year}-${String(++seq).padStart(4, "0")}`;

  // 1) New Lead (RECEIVED) — fresh, multi-part
  await prisma.partRequest.create({
    data: {
      humanId: id(),
      partName: "Front brake pads",
      category: "Multiple",
      partsJson: JSON.stringify([
        { name: "Front brake pads", qty: 1, condition: "any" },
        { name: "Oil filter", qty: 2, condition: "any" },
        { name: "Air filter", qty: 1, condition: "any" },
      ]),
      vin: "JTEBU14R78K012345",
      make: "Toyota",
      model: "Land Cruiser",
      year: 2018,
      customerName: "Ahmed Al Mansoori",
      phone: "+971501234567",
      city: "Abu Dhabi",
      country: "United Arab Emirates",
      contactPref: "whatsapp",
      partPreference: "any",
      status: "RECEIVED",
      receivedAt: ago(0.5),
      createdAt: ago(0.5),
    },
  });

  // 2) Sourcing (SOURCING) — aging, single, has part number
  await prisma.partRequest.create({
    data: {
      humanId: id(),
      partName: "Alternator",
      category: "Single",
      partsJson: JSON.stringify([{ name: "Alternator", qty: 1, condition: "oem" }]),
      partNumber: "23100-1KA0A",
      vin: "SJNFAAJ11U1012345",
      make: "Nissan",
      model: "Altima",
      year: 2016,
      customerName: "Fatima Khan",
      phone: "+971529876543",
      email: "fatima@example.com",
      city: "Dubai",
      country: "United Arab Emirates",
      contactPref: "call",
      partPreference: "oem",
      status: "SOURCING",
      receivedAt: ago(6),
      sourcingAt: ago(5),
      createdAt: ago(6),
    },
  });

  // 3) Quoted (QUOTED) — with a quote
  const q3 = await prisma.partRequest.create({
    data: {
      humanId: id(),
      partName: "Headlight assembly",
      category: "Single",
      partsJson: JSON.stringify([{ name: "Headlight assembly (left)", qty: 1, condition: "genuine" }]),
      vin: "WBA8E9C5XGK012345",
      make: "BMW",
      model: "320i",
      year: 2017,
      customerName: "Omar Saeed",
      phone: "+971555551212",
      city: "Sharjah",
      country: "United Arab Emirates",
      contactPref: "whatsapp",
      partPreference: "genuine",
      status: "QUOTED",
      receivedAt: ago(20),
      sourcingAt: ago(19),
      quotedAt: ago(2),
      createdAt: ago(20),
    },
  });
  await prisma.quote.create({
    data: {
      requestId: q3.id,
      price: 1450,
      condition: "genuine",
      warranty: "3 months",
      eta: "2-3 days",
      note: "Original BMW part, in stock.",
    },
  });

  // 4) Won (CONFIRMED) — overdue, multi-part, with a quote
  const q4 = await prisma.partRequest.create({
    data: {
      humanId: id(),
      partName: "Timing belt kit",
      category: "Multiple",
      partsJson: JSON.stringify([
        { name: "Timing belt kit", qty: 1, condition: "oem" },
        { name: "Water pump", qty: 1, condition: "oem" },
      ]),
      vin: "JTHBK1GG2D2012345",
      make: "Lexus",
      model: "ES350",
      year: 2014,
      customerName: "Mariam Al Hashimi",
      phone: "+971502223344",
      city: "Al Ain",
      country: "United Arab Emirates",
      contactPref: "whatsapp",
      partPreference: "oem",
      status: "CONFIRMED",
      receivedAt: ago(50),
      sourcingAt: ago(49),
      quotedAt: ago(40),
      confirmedAt: ago(30),
      createdAt: ago(50),
    },
  });
  await prisma.quote.create({
    data: { requestId: q4.id, price: 890, condition: "oem", warranty: "6 months", eta: "Next day" },
  });

  // 5) Won / Delivered (COMPLETED) — overdue, with a quote
  const q5 = await prisma.partRequest.create({
    data: {
      humanId: id(),
      partName: "Side mirror",
      category: "Single",
      partsJson: JSON.stringify([{ name: "Side mirror (right)", qty: 1, condition: "aftermarket" }]),
      vin: "MMBJNKL10JH012345",
      make: "Mitsubishi",
      model: "Pajero",
      year: 2019,
      customerName: "Yousef Ibrahim",
      phone: "+971563334455",
      city: "Ajman",
      country: "United Arab Emirates",
      contactPref: "call",
      partPreference: "aftermarket",
      status: "COMPLETED",
      receivedAt: ago(72),
      sourcingAt: ago(71),
      quotedAt: ago(60),
      confirmedAt: ago(55),
      completedAt: ago(48),
      createdAt: ago(72),
    },
  });
  await prisma.quote.create({
    data: { requestId: q5.id, price: 320, condition: "aftermarket", warranty: "1 month", eta: "Delivered" },
  });

  // 6) Lost (DECLINED)
  await prisma.partRequest.create({
    data: {
      humanId: id(),
      partName: "Gearbox",
      category: "Single",
      partsJson: JSON.stringify([{ name: "Complete gearbox", qty: 1, condition: "any" }]),
      vin: "WVWZZZ1KZ8W012345",
      make: "Volkswagen",
      model: "Golf",
      year: 2012,
      customerName: "Sara Abdullah",
      phone: "+971557778899",
      city: "Ras Al Khaimah",
      country: "United Arab Emirates",
      contactPref: "whatsapp",
      partPreference: "any",
      status: "DECLINED",
      receivedAt: ago(96),
      sourcingAt: ago(95),
      declinedAt: ago(90),
      declineReason: "Customer found locally",
      createdAt: ago(96),
    },
  });

  console.log("Seeded 6 sample requests.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
