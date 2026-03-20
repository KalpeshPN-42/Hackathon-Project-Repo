import { pgTable, text, serial, timestamp, boolean, integer, jsonb, date, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const jobTypeEnum = pgEnum("job_type", ["internship", "fulltime", "parttime", "contract", "remote"]);
export const experienceLevelEnum = pgEnum("experience_level", ["fresher", "junior", "mid", "senior"]);
export const jobStatusEnum = pgEnum("job_status", ["active", "closed", "draft"]);

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id").notNull().references(() => usersTable.id),
  company: text("company").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: jobTypeEnum("type").notNull(),
  location: text("location").notNull(),
  isRemote: boolean("is_remote").notNull().default(false),
  techStack: jsonb("tech_stack").$type<string[]>().notNull().default([]),
  minPay: numeric("min_pay"),
  maxPay: numeric("max_pay"),
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
  benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
  applicationDeadline: date("application_deadline"),
  openings: integer("openings").notNull().default(1),
  status: jobStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
