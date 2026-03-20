import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { profilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized", message: "Not authenticated" });
    return null;
  }
  return userId;
}

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startYear: z.number(),
  endYear: z.number().optional(),
  gpa: z.string().optional(),
  achievements: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  techStack: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  techStack: z.array(z.string()).optional(),
  url: z.string().optional(),
  githubUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const profileInputSchema = z.object({
  headline: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  certifications: z.array(certificationSchema),
  languages: z.array(z.string()).optional(),
  preferredRoles: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  expectedSalary: z.number().optional(),
  availableFrom: z.string().optional(),
  openToRemote: z.boolean().optional(),
});

router.get("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  if (!profile) {
    res.status(404).json({ error: "Not Found", message: "Profile not found" });
    return;
  }
  res.json(profile);
});

router.put("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = profileInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", message: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));

  let profile;
  if (existing) {
    [profile] = await db.update(profilesTable)
      .set({
        ...data,
        skills: data.skills as any,
        education: data.education as any,
        experience: data.experience as any,
        projects: data.projects as any,
        certifications: data.certifications as any,
        languages: (data.languages ?? []) as any,
        preferredRoles: (data.preferredRoles ?? []) as any,
        preferredLocations: (data.preferredLocations ?? []) as any,
        expectedSalary: data.expectedSalary?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(profilesTable.userId, userId))
      .returning();
  } else {
    [profile] = await db.insert(profilesTable).values({
      userId,
      ...data,
      skills: data.skills as any,
      education: data.education as any,
      experience: data.experience as any,
      projects: data.projects as any,
      certifications: data.certifications as any,
      languages: (data.languages ?? []) as any,
      preferredRoles: (data.preferredRoles ?? []) as any,
      preferredLocations: (data.preferredLocations ?? []) as any,
      expectedSalary: data.expectedSalary?.toString(),
    }).returning();
  }

  const isComplete =
    data.skills.length > 0 &&
    data.education.length > 0 &&
    !!data.headline;

  await db.update(usersTable)
    .set({ profileComplete: isComplete })
    .where(eq(usersTable.id, userId));

  res.json(profile);
});

export default router;
