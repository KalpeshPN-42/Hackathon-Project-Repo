import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { jobsTable, usersTable, applicationsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, sql, count } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

const jobInputSchema = z.object({
  company: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["internship", "fulltime", "parttime", "contract", "remote"]),
  location: z.string(),
  isRemote: z.boolean().optional(),
  techStack: z.array(z.string()),
  minPay: z.number().optional(),
  maxPay: z.number().optional(),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"]),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(),
  openings: z.number().optional(),
  status: z.enum(["active", "closed", "draft"]).optional(),
});

router.get("/", async (req, res) => {
  const {
    search, type, location, techStack, minPay, maxPay,
    experienceLevel, page = "1", limit = "20"
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  const conditions: any[] = [eq(jobsTable.status, "active")];

  if (search) {
    conditions.push(
      sql`(${ilike(jobsTable.title, `%${search}%`)} OR ${ilike(jobsTable.company, `%${search}%`)} OR ${ilike(jobsTable.description, `%${search}%`)})`
    );
  }
  if (type) conditions.push(eq(jobsTable.type, type as any));
  if (location) conditions.push(ilike(jobsTable.location, `%${location}%`));
  if (experienceLevel) conditions.push(eq(jobsTable.experienceLevel, experienceLevel as any));
  if (minPay) conditions.push(gte(jobsTable.maxPay, minPay));
  if (maxPay) conditions.push(lte(jobsTable.minPay, maxPay));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [jobs, totalResult] = await Promise.all([
    db.select({
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
    })
      .from(jobsTable)
      .innerJoin(usersTable, eq(jobsTable.recruiterId, usersTable.id))
      .where(whereClause)
      .orderBy(sql`${jobsTable.createdAt} DESC`)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: count() }).from(jobsTable).where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      const [appCount] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
      return { ...job, applicationsCount: appCount?.count ?? 0 };
    })
  );

  res.json({
    jobs: jobsWithCounts,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

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
  }).from(jobsTable).innerJoin(usersTable, eq(jobsTable.recruiterId, usersTable.id)).where(eq(jobsTable.id, id));

  if (!job) { res.status(404).json({ error: "Not Found" }); return; }

  const [appCount] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, id));
  res.json({ ...job, applicationsCount: appCount?.count ?? 0 });
});

router.post("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = jobInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", message: parsed.error.message }); return; }

  const data = parsed.data;
  const [job] = await db.insert(jobsTable).values({
    recruiterId: userId,
    company: data.company,
    title: data.title,
    description: data.description,
    type: data.type,
    location: data.location,
    isRemote: data.isRemote ?? false,
    techStack: data.techStack as any,
    minPay: data.minPay?.toString(),
    maxPay: data.maxPay?.toString(),
    experienceLevel: data.experienceLevel,
    requirements: (data.requirements ?? []) as any,
    responsibilities: (data.responsibilities ?? []) as any,
    benefits: (data.benefits ?? []) as any,
    applicationDeadline: data.applicationDeadline,
    openings: data.openings ?? 1,
    status: data.status ?? "active",
  }).returning();

  res.status(201).json({ ...job, recruiterName: "", applicationsCount: 0 });
});

router.put("/:id", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

  const parsed = jobInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", message: parsed.error.message }); return; }

  const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not Found" }); return; }
  if (existing.recruiterId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  const data = parsed.data;
  const [job] = await db.update(jobsTable).set({
    company: data.company,
    title: data.title,
    description: data.description,
    type: data.type,
    location: data.location,
    isRemote: data.isRemote ?? false,
    techStack: data.techStack as any,
    minPay: data.minPay?.toString(),
    maxPay: data.maxPay?.toString(),
    experienceLevel: data.experienceLevel,
    requirements: (data.requirements ?? []) as any,
    responsibilities: (data.responsibilities ?? []) as any,
    benefits: (data.benefits ?? []) as any,
    applicationDeadline: data.applicationDeadline,
    openings: data.openings ?? 1,
    status: data.status ?? "active",
  }).where(eq(jobsTable.id, id)).returning();

  res.json({ ...job, recruiterName: "", applicationsCount: 0 });
});

router.delete("/:id", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Bad Request" }); return; }

  const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not Found" }); return; }
  if (existing.recruiterId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.json({ success: true, message: "Job deleted" });
});

export default router;
