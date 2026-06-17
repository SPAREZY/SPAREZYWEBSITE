// Wipes ALL orders (PartRequest) and their cascaded quotes + activity rows.
// Run against the live DB with:  npm run db:reset-orders
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.partRequest.deleteMany({});
  console.log(`Deleted ${result.count} order(s), plus their quotes and activity.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
