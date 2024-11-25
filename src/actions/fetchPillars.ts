'use server';

import { Pillar } from '../types/Pillar';
import { db } from '../db/db';
import { pillarsTable } from '../db/schema'
import { desc } from 'drizzle-orm';


export async function fetchPillars(): Promise<Pillar[]> {
  const result = await db.select().from(pillarsTable).orderBy(desc(pillarsTable.weight));
  return result.map(row => ({
    ...row,
    status: row.status as "Pending" | "Registered"
  }));
}
