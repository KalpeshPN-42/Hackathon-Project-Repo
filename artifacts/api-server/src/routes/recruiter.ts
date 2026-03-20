import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { applicationsTable, jobsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/applications", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const recruiterJobs = await db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.recruiterId, userId));
  const jobIds = recruiterJobs.map(j => j.id);

  if (jobIds.length === 0) { res.json([]); return; }

  const applications = await Promise.all(
    jobIds.map(async (jobId) => {
      const apps = await db.select({
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
        .where(eq(applicationsTable.jobId, jobId));
      return apps;
    })
  );

  const allApps = applications.flat();
  const withJobs = await Promise.all(allApps.map(async (app) => {
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

export default router;
