import {
	pgTable,
	serial,
	text,
	varchar,
	timestamp,
	bigint,
} from "drizzle-orm/pg-core";

export const pillarsTable = pgTable("pillars", {
	id: serial("id").primaryKey(),
	alphanet_pillar_name: text("alphanet_pillar_name").notNull().unique(),
	alphanet_pillar_address: text("alphanet_pillar_address").notNull().unique(),
	alphanet_pillar_public_key: text("alphanet_pillar_public_key").unique(),
	alphanet_pillar_signature: text("alphanet_pillar_signature").unique(),
	hqz_pillar_name: text("hqz_pillar_name"),
	hqz_owner_address: text("hqz_owner_address"),
	hqz_withdraw_address: text("hqz_withdraw_address"),
	hqz_producer_address: text("hqz_producer_address"),
	status: varchar("status", { length: 50 })
		.notNull()
		.default("Pending")
		.$type<"Pending" | "Registered">(),
	weight: bigint("weight", { mode: "bigint" }).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
	verified_at: timestamp("verified_at"),
});
