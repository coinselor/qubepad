import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
