'use server';

import { db } from '../db/db';
import { PillarUpdateData } from '../src/types/PillarUpdateData';
import { pillarsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function submitPillarData(pillarName: string, data: PillarUpdateData) {

  await db.update(pillarsTable)
    .set({
      hqz_pillar_name: data.hqz_pillar_name,
      hqz_owner_address: data.hqz_owner_address,
      hqz_withdraw_address: data.hqz_withdraw_address,
      hqz_producer_address: data.hqz_producer_address,
      status: data.status,
      updated_at: new Date(),
    })
    .where(eq(pillarsTable.alphanet_pillar_name, pillarName));
}
