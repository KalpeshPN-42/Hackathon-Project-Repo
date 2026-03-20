import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { applicationsTable, jobsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const applications = await db.select({
    id: applicationsTable.id,
    jobId: applicationsTable.jobId,
    userId: applicationsTable.userId,
    coverLetter: applicationsTable.coverLetter,
    status: applicationsTable.status,
    appliedAt: applicationsTable.appliedAt,
    updatedAt: applicationsTable.updatedAt,
    applicantName: usersTable.name,
    applicantEmail: usersTable.email,
  })
    .from(applicationsTable)
    .innerJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
    .where(eq(applicationsTable.userId, userId));

  const withJobs = await Promise.all(applications.map(async (app) => {
    const [job] = await db.select({
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
    }).from(jobsTable).innerJoin(usersTable, eq(jobsTable.recruiterId, usersTable.id)).where(eq(jobsTable.id, app.jobId));
    return { ...app, job };
  }));

  res.json(withJobs);
});

router.post("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const schema = z.object({ jobId: z.number(), coverLetter: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { jobId, coverLetter } = parsed.data;

  const [existing] = await db.select().from(applicationsTable)
    .where(eq(applicationsTable.jobId, jobId));

  const [application] = await db.insert(applicationsTable).values({
    jobId,
    userId,
    coverLetter,
    status: "pending",
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...application, applicantName: user?.name, applicantEmail: user?.email });
});

router.put("/:id/status", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

  const schema = z.object({ status: z.enum(["pending", "reviewing", "shortlisted", "rejected", "offered"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [application] = await db.update(applicationsTable)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(applicationsTable.id, id))
    .returning();

  if (!application) { res.status(404).json({ error: "Not Found" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, application.userId));
  res.json({ ...application, applicantName: user?.name, applicantEmail: user?.email });
});

export default router;
