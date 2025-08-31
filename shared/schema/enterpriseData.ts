import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Feature Flags
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isEnabled: boolean("is_enabled").notNull().default(false),
  rules: jsonb("rules"),
  rolloutPercentage: integer("rollout_percentage"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

export const insertFeatureFlagSchema = createInsertSchema(featureFlags);
export const selectFeatureFlagSchema = createSelectSchema(featureFlags);

// A/B Tests
export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  variants: text("variants").array().notNull(),
  trafficAllocation: integer("traffic_allocation").notNull().default(100),
  goals: text("goals").array().notNull(),
  status: text("status").notNull().default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type ABTest = typeof abTests.$inferSelect;
export type InsertABTest = typeof abTests.$inferInsert;

export const insertABTestSchema = createInsertSchema(abTests);
export const selectABTestSchema = createSelectSchema(abTests);

// A/B Test Assignments
export const abTestAssignments = pgTable("ab_test_assignments", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  userId: integer("user_id").notNull(),
  variant: text("variant").notNull(),
  conversions: jsonb("conversions").default({}),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type ABTestAssignment = typeof abTestAssignments.$inferSelect;
export type InsertABTestAssignment = typeof abTestAssignments.$inferInsert;

export const insertABTestAssignmentSchema = createInsertSchema(abTestAssignments);
export const selectABTestAssignmentSchema = createSelectSchema(abTestAssignments);

// Data Warehouse ETL Jobs
export const dataWarehouseJobs = pgTable("data_warehouse_jobs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  entity: text("entity").notNull(),
  destination: text("destination").notNull(),
  config: jsonb("config"),
  schedule: text("schedule"),
  cronExpression: text("cron_expression"),
  status: text("status").notNull().default("scheduled"),
  lastRunStatus: text("last_run_status"),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  rowsProcessed: integer("rows_processed"),
  lastRunDetails: jsonb("last_run_details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type DataWarehouseJob = typeof dataWarehouseJobs.$inferSelect;
export type InsertDataWarehouseJob = typeof dataWarehouseJobs.$inferInsert;

export const insertDataWarehouseJobSchema = createInsertSchema(dataWarehouseJobs);
export const selectDataWarehouseJobSchema = createSelectSchema(dataWarehouseJobs);

// Cohort Definitions
export const cohortDefinitions = pgTable("cohort_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  criteria: jsonb("criteria").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type CohortDefinition = typeof cohortDefinitions.$inferSelect;
export type InsertCohortDefinition = typeof cohortDefinitions.$inferInsert;

export const insertCohortDefinitionSchema = createInsertSchema(cohortDefinitions);
export const selectCohortDefinitionSchema = createSelectSchema(cohortDefinitions);

// Cohort Members
export const cohortMembers = pgTable("cohort_members", {
  id: serial("id").primaryKey(),
  cohortId: integer("cohort_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  exitedAt: timestamp("exited_at")
});

export type CohortMember = typeof cohortMembers.$inferSelect;
export type InsertCohortMember = typeof cohortMembers.$inferInsert;

export const insertCohortMemberSchema = createInsertSchema(cohortMembers);
export const selectCohortMemberSchema = createSelectSchema(cohortMembers);