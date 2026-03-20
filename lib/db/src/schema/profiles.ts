import { pgTable, text, serial, timestamp, boolean, integer, jsonb, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  headline: text("headline"),
  phone: text("phone"),
  location: text("location"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  summary: text("summary"),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  education: jsonb("education").$type<object[]>().notNull().default([]),
  experience: jsonb("experience").$type<object[]>().notNull().default([]),
  projects: jsonb("projects").$type<object[]>().notNull().default([]),
  certifications: jsonb("certifications").$type<object[]>().notNull().default([]),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  preferredRoles: jsonb("preferred_roles").$type<string[]>().notNull().default([]),
  preferredLocations: jsonb("preferred_locations").$type<string[]>().notNull().default([]),
  expectedSalary: numeric("expected_salary"),
  availableFrom: date("available_from"),
  openToRemote: boolean("open_to_remote").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
