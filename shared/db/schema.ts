import { sql } from "drizzle-orm";
import {
    check,
    index,
    integer,
    pgTable,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull(),
    email: varchar().notNull().unique(),

    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => [
    uniqueIndex("email_idx").on(table.email),
]);

export const accountsTable = pgTable("accounts", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull(),
    user_id: integer().references(() => usersTable.id),
    description: varchar(),

    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => [
    index("user_id_idx").on(table.name, table.user_id),
]);

export const categoriesTable = pgTable("categories", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull(),
    user_id: integer().references(() => usersTable.id),
    description: varchar(),
    type: integer().notNull(),
    color: varchar().notNull(),

    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => [
    index("user_id_idx").on(table.name, table.user_id),
    check(
        "type_valid", // constraint name
        sql`${table.type} IN (0, 1)`, // condition
    ),
]);

export const transactionsTable = pgTable("transactions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    type: integer().notNull(),
    category_id: integer().references(() => categoriesTable.id),
    account_id: integer().references(() => accountsTable.id),
    amount: integer().notNull(),
    description: varchar(),

    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => [
    index("category_id_idx").on(table.category_id),
    index("account_id_idx").on(table.account_id),
    check(
        "type_valid", // constraint name
        sql`${table.type} IN (0, 1)`, // condition
    ),
]);
