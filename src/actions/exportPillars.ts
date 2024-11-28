"use server";

import { db } from "../db/db";
import { pillarsTable } from "../db/schema";
import { desc } from "drizzle-orm";

export async function exportPillars() {
  try {
    const pillars = await db.select().from(pillarsTable).orderBy(desc(pillarsTable.created_at));

    // Convert BigInt to string for JSON serialization
    const serializedPillars = pillars.map(pillar => ({
      ...pillar,
      weight: pillar.weight.toString(),
      created_at: pillar.created_at.toISOString(),
      updated_at: pillar.updated_at.toISOString(),
      verified_at: pillar.verified_at?.toISOString() || null,
    }));

    return { success: true, data: serializedPillars };
  } catch (error) {
    console.error("Error exporting pillars:", error);
    return { success: false, error: "Failed to export data" };
  }
}
