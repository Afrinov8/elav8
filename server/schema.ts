import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  numeric,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const moduleChoiceEnum = pgEnum("module_choice", ["stock", "jobs", "both"]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending",
  "sent",
  "paid",
  "overdue",
]);

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  registered: boolean("registered").notNull().default(false),
  registrationNumber: varchar("registration_number", { length: 100 }),
  addressSameAsPhysical: boolean("address_same_as_physical").notNull().default(true),
  businessAddress: text("business_address"),
  moduleChoice: moduleChoiceEnum("module_choice").notNull().default("both"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const businessRelations = relations(businesses, ({ many }) => ({
  users: many(users),
  inventoryItems: many(inventoryItems),
  sales: many(sales),
  invoices: many(invoices),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 200 }).unique(),
  passwordHash: text("password_hash").notNull(),
  dateOfBirth: varchar("date_of_birth", { length: 32 }),
  physicalAddress: text("physical_address"),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRelations = relations(users, ({ one }) => ({
  business: one(businesses, { fields: [users.businessId], references: [businesses.id] }),
}));

export const consents = pgTable("consents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eula: boolean("eula").notNull().default(false),
  acknowledgement: boolean("acknowledgement").notNull().default(false),
  smsConsent: boolean("sms_consent").notNull().default(false),
  dataSharing: boolean("data_sharing").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull(),
  stockQty: integer("stock_qty").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inventoryRelations = relations(inventoryItems, ({ one }) => ({
  business: one(businesses, { fields: [inventoryItems.businessId], references: [businesses.id] }),
}));

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  itemId: integer("item_id").references(() => inventoryItems.id, { onDelete: "set null" }),
  description: varchar("description", { length: 200 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 32 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("pending"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
