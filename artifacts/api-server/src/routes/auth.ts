import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["student", "recruiter"]),
  companyName: z.string().optional(),
  companyWebsite: z.string().optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

function sanitizeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", message: parsed.error.message });
    return;
  }
  const { email, password, name, role } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const verified = role === "student";

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name,
    role,
    verified,
  }).returning();

  (req.session as any).userId = user.id;
  res.status(201).json({ user: sanitizeUser(user), message: "Account created" });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", message: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  (req.session as any).userId = user.id;
  res.json({ user: sanitizeUser(user), message: "Login successful" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true, message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized", message: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "User not found" });
    return;
  }

  res.json(sanitizeUser(user));
});

export default router;
