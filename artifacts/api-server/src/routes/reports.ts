import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reportsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

const createReportSchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

const replySchema = z.object({
  adminReply: z.string().min(1),
  status: z.enum(["open", "in_progress", "resolved"]),
});

async function getAuthUser(req: any) {
  const userId = req.session?.userId;
  if (!userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user || null;
}

router.post("/", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", message: parsed.error.message });
    return;
  }

  const [report] = await db.insert(reportsTable).values({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    subject: parsed.data.subject,
    message: parsed.data.message,
  }).returning();

  res.status(201).json(report);
});

router.get("/my", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const reports = await db.select().from(reportsTable)
    .where(eq(reportsTable.userId, user.id))
    .orderBy(sql`${reportsTable.createdAt} DESC`);

  res.json(reports);
});

router.get("/", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

  const reports = await db.select().from(reportsTable)
    .orderBy(sql`${reportsTable.createdAt} DESC`);

  res.json(reports);
});

router.patch("/:id/reply", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", message: parsed.error.message });
    return;
  }

  const [report] = await db.update(reportsTable).set({
    adminReply: parsed.data.adminReply,
    status: parsed.data.status,
    resolvedAt: parsed.data.status === "resolved" ? new Date() : null,
  }).where(eq(reportsTable.id, id)).returning();

  if (!report) { res.status(404).json({ error: "Not Found" }); return; }
  res.json(report);
});

export default router;
