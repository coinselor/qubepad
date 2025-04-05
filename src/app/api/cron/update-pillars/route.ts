import { NextResponse } from 'next/server';
import { fetchAndUpsertPillars } from '@/actions/fetchAndUpsertPillars';
import { db } from '@/db/db';
import { system } from '@/db/schema';
import { eq} from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const userAgent = request.headers.get('User-Agent') || '';
  
  const isVercelCron = 
    userAgent.includes('Vercel') && 
    authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
  if (!isVercelCron && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Check when the last update occurred
    const systemRows = await db.select()
      .from(system);
    
    const systemRecord = systemRows[0];
    
    const now = new Date();
    const lastUpdateTime = systemRecord?.last_pillar_update || new Date(0);
    
    // Rate limiting - only allow once per hour
    const hourInMs = 60 * 60 * 1000;
    if (now.getTime() - lastUpdateTime.getTime() < hourInMs && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        error: 'Rate limited', 
        lastUpdate: lastUpdateTime.toISOString(),
        nextAllowedRun: new Date(lastUpdateTime.getTime() + hourInMs).toISOString() 
      }, { status: 429 });
    }
    
    await fetchAndUpsertPillars();
    
    if (systemRecord) {
      await db.update(system)
        .set({ 
          last_pillar_update: now,
          updated_at: now
        })
        .where(eq(system.id, systemRecord.id));
    } else {
      await db.insert(system)
        .values({
          last_pillar_update: now,
        });
    }
    
    return NextResponse.json({ 
      success: true, 
      timestamp: now.toISOString() 
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
