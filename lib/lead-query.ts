import type { Prisma } from "@prisma/client";

const VALID_STATUS = ["RECEIVED", "SOURCING", "QUOTED", "CONFIRMED", "COMPLETED", "DECLINED"];
const VALID_PRIORITY = ["LOW", "NORMAL", "HIGH", "URGENT"];

// Builds a Prisma `where` clause for the admin leads list / export from the
// query string (search + status + priority + date range).
export function buildLeadWhere(searchParams: URLSearchParams): Prisma.PartRequestWhereInput {
  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim().toUpperCase();
  const priority = (searchParams.get("priority") ?? "").trim().toUpperCase();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const and: Prisma.PartRequestWhereInput[] = [];

  if (q) {
    and.push({
      OR: [
        { humanId: { contains: q } },
        { partName: { contains: q } },
        { vin: { contains: q } },
        { customerName: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { make: { contains: q } },
        { model: { contains: q } },
        { city: { contains: q } },
      ],
    });
  }
  if (VALID_STATUS.includes(status)) and.push({ status });
  if (VALID_PRIORITY.includes(priority)) and.push({ priority });
  if (from || to) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (from) createdAt.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    and.push({ createdAt });
  }

  return and.length ? { AND: and } : {};
}
