import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const reportStatusEnum = pgEnum("report_status", ["open", "in_progress", "resolved"]);

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userRole: text("user_role").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: reportStatusEnum("status").notNull().default("open"),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export type Report = typeof reportsTable.$inferSelect;
