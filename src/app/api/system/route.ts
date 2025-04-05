import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { system } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const systemInfo = await db.select().from(system).orderBy(desc(system.id)).limit(1);
    
    if (systemInfo.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          lastUpdate: null 
        } 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        lastUpdate: systemInfo[0].last_pillar_update 
      } 
    });
  } catch (error) {
    console.error("Error fetching system info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system info" },
      { status: 500 }
    );
  }
}
