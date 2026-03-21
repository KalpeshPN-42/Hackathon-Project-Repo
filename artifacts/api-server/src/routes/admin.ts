import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, jobsTable, applicationsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return false; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return false; }
  return true;
}

router.get("/users", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const users = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    profileComplete: usersTable.profileComplete,
    verified: usersTable.verified,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(sql`${usersTable.createdAt} DESC`);
  res.json(users);
});

router.patch("/users/:id/verify", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.role !== "recruiter") { res.status(400).json({ error: "Only recruiter accounts can be verified" }); return; }

  const [updated] = await db.update(usersTable)
    .set({ verified: true })
    .where(eq(usersTable.id, id))
    .returning();

  res.json({ success: true, user: updated });
});

router.patch("/users/:id/reject", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true, message: "User account removed" });
});

router.delete("/users/:id", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true, message: "User deleted" });
});

router.get("/jobs", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const jobs = await db.select({
    id: jobsTable.id,
    recruiterId: jobsTable.recruiterId,
    recruiterName: usersTable.name,
    company: jobsTable.company,
    title: jobsTable.title,
    description: jobsTable.description,
    type: jobsTable.type,
    location: jobsTable.location,
    isRemote: jobsTable.isRemote,
    techStack: jobsTable.techStack,
    minPay: jobsTable.minPay,
    maxPay: jobsTable.maxPay,
    experienceLevel: jobsTable.experienceLevel,
    requirements: jobsTable.requirements,
    responsibilities: jobsTable.responsibilities,
    benefits: jobsTable.benefits,
    applicationDeadline: jobsTable.applicationDeadline,
    openings: jobsTable.openings,
    status: jobsTable.status,
    createdAt: jobsTable.createdAt,
  }).from(jobsTable).innerJoin(usersTable, eq(jobsTable.recruiterId, usersTable.id)).orderBy(sql`${jobsTable.createdAt} DESC`);

  const [totalResult] = await db.select({ count: count() }).from(jobsTable);
  res.json({ jobs, total: totalResult?.count ?? 0, page: 1, totalPages: 1 });
});

export default router;
