import { drizzle } from "drizzle-orm/neon-serverless";
import { config } from "dotenv";

config({ path: ".env" }); // or .env.local

export const db = drizzle(process.env.DATABASE_URL!);