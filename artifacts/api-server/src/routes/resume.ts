import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { profilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

const generateSchema = z.object({
  templateId: z.enum(["modern", "classic", "minimal", "bold"]),
  includePhoto: z.boolean().optional(),
});

function buildResumeHtml(user: any, profile: any, templateId: string): string {
  const skills = (profile.skills as string[]) ?? [];
  const education = (profile.education as any[]) ?? [];
  const experience = (profile.experience as any[]) ?? [];
  const projects = (profile.projects as any[]) ?? [];
  const certifications = (profile.certifications as any[]) ?? [];

  const themes: Record<string, { primary: string; bg: string; accent: string; font: string }> = {
    modern: { primary: "#1e3a5f", bg: "#f8fafc", accent: "#3b82f6", font: "Inter, sans-serif" },
    classic: { primary: "#1a1a2e", bg: "#ffffff", accent: "#c41e3a", font: "Georgia, serif" },
    minimal: { primary: "#111827", bg: "#ffffff", accent: "#6b7280", font: "'Helvetica Neue', sans-serif" },
    bold: { primary: "#0f172a", bg: "#f1f5f9", accent: "#7c3aed", font: "'Roboto', sans-serif" },
  };
  const theme = themes[templateId] ?? themes.modern;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${user.name} - Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${theme.font}; background: ${theme.bg}; color: #1a1a1a; font-size: 11pt; line-height: 1.5; }
  @media print { body { background: white; } .no-print { display: none; } }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; background: white; min-height: 100vh; }
  .header { border-bottom: 3px solid ${theme.primary}; padding-bottom: 16px; margin-bottom: 20px; }
  .name { font-size: 28pt; font-weight: 700; color: ${theme.primary}; letter-spacing: -0.5px; }
  .headline { font-size: 13pt; color: ${theme.accent}; margin-top: 4px; font-weight: 500; }
  .contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; font-size: 9pt; color: #555; }
  .contact a { color: ${theme.accent}; text-decoration: none; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 12pt; font-weight: 700; color: ${theme.primary}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid ${theme.accent}; padding-bottom: 4px; margin-bottom: 10px; }
  .summary { font-size: 10pt; color: #444; line-height: 1.7; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: ${theme.primary}15; color: ${theme.primary}; padding: 2px 10px; border-radius: 12px; font-size: 9pt; font-weight: 500; border: 1px solid ${theme.primary}30; }
  .entry { margin-bottom: 14px; }
  .entry-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .entry-title { font-size: 11pt; font-weight: 700; color: #1a1a1a; }
  .entry-sub { font-size: 10pt; color: ${theme.accent}; font-weight: 500; }
  .entry-date { font-size: 9pt; color: #888; white-space: nowrap; }
  .entry-location { font-size: 9pt; color: #777; margin-top: 2px; }
  .entry-desc { font-size: 9.5pt; color: #444; margin-top: 6px; line-height: 1.6; }
  .tech-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .tech-tag { background: ${theme.accent}15; color: ${theme.accent}; padding: 1px 7px; border-radius: 8px; font-size: 8pt; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="name">${user.name}</div>
    ${profile.headline ? `<div class="headline">${profile.headline}</div>` : ""}
    <div class="contact">
      ${user.email ? `<span>✉ ${user.email}</span>` : ""}
      ${profile.phone ? `<span>📞 ${profile.phone}</span>` : ""}
      ${profile.location ? `<span>📍 ${profile.location}</span>` : ""}
      ${profile.linkedinUrl ? `<a href="${profile.linkedinUrl}" target="_blank">LinkedIn</a>` : ""}
      ${profile.githubUrl ? `<a href="${profile.githubUrl}" target="_blank">GitHub</a>` : ""}
      ${profile.portfolioUrl ? `<a href="${profile.portfolioUrl}" target="_blank">Portfolio</a>` : ""}
    </div>
  </div>

  ${profile.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary">${profile.summary}</div>
  </div>` : ""}

  ${skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}
    </div>
  </div>` : ""}

  ${experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Work Experience</div>
    ${experience.map((e: any) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${e.role}</div>
          <div class="entry-sub">${e.company}</div>
          ${e.location ? `<div class="entry-location">${e.location}</div>` : ""}
        </div>
        <div class="entry-date">${e.startDate} – ${e.current ? "Present" : (e.endDate || "")}</div>
      </div>
      ${e.description ? `<div class="entry-desc">${e.description}</div>` : ""}
      ${e.techStack?.length ? `<div class="tech-tags">${e.techStack.map((t: string) => `<span class="tech-tag">${t}</span>`).join("")}</div>` : ""}
    </div>`).join("")}
  </div>` : ""}

  ${education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${education.map((e: any) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${e.degree} in ${e.field}</div>
          <div class="entry-sub">${e.institution}</div>
          ${e.gpa ? `<div class="entry-location">GPA: ${e.gpa}</div>` : ""}
        </div>
        <div class="entry-date">${e.startYear} – ${e.endYear || "Present"}</div>
      </div>
      ${e.achievements ? `<div class="entry-desc">${e.achievements}</div>` : ""}
    </div>`).join("")}
  </div>` : ""}

  ${projects.length > 0 ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${projects.map((p: any) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${p.name}${p.url ? ` <a href="${p.url}" style="font-size:9pt;color:${theme.accent}">↗</a>` : ""}${p.githubUrl ? ` <a href="${p.githubUrl}" style="font-size:9pt;color:${theme.accent}">GitHub</a>` : ""}</div>
        </div>
        ${p.startDate ? `<div class="entry-date">${p.startDate}${p.endDate ? ` – ${p.endDate}` : ""}</div>` : ""}
      </div>
      <div class="entry-desc">${p.description}</div>
      ${p.techStack?.length ? `<div class="tech-tags">${p.techStack.map((t: string) => `<span class="tech-tag">${t}</span>`).join("")}</div>` : ""}
    </div>`).join("")}
  </div>` : ""}

  ${certifications.length > 0 ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    ${certifications.map((c: any) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${c.name}</div>
          <div class="entry-sub">${c.issuer}</div>
        </div>
        ${c.issueDate ? `<div class="entry-date">${c.issueDate}${c.expiryDate ? ` – ${c.expiryDate}` : ""}</div>` : ""}
      </div>
      ${c.credentialUrl ? `<div class="entry-location"><a href="${c.credentialUrl}" style="color:${theme.accent}">View Credential</a></div>` : ""}
    </div>`).join("")}
  </div>` : ""}
</div>
</body>
</html>`;
}

router.post("/generate", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", message: parsed.error.message }); return; }

  const { templateId } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  if (!profile) { res.status(404).json({ error: "Not Found", message: "Please complete your profile first" }); return; }

  const html = buildResumeHtml(user, profile, templateId);
  res.json({ html, templateId });
});

export default router;
