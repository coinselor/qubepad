"use server";

import { ApiPillarsResponse, ApiPillar } from "@/types/ZenonHubResponse";
import { db } from "../db/db";
import { pillarsTable } from "../db/schema";
import { Pillar } from "../types/Pillar";

export async function fetchAndUpsertPillars() {
	const response = await fetch("https://zenonhub.io/api/nom/pillars/get-all");
	const data: ApiPillarsResponse = await response.json();

	const pillars: Partial<Pillar>[] = data.data.list.map(
		(pillar: ApiPillar) => ({
			alphanet_pillar_name: pillar.name,
			alphanet_pillar_address: pillar.ownerAddress,
			weight: BigInt(pillar.weight),
			updated_at: new Date(),
		})
	);

	for (const pillar of pillars) {
		await db
			.insert(pillarsTable)
			.values(pillar as Required<Pick<Pillar, 'alphanet_pillar_name' | 'alphanet_pillar_address' | 'weight' | 'updated_at'>>)
			.onConflictDoUpdate({
				target: pillarsTable.alphanet_pillar_name,
				set: {
					weight: pillar.weight,
					updated_at: pillar.updated_at,
				},
			});
	}
}

export async function scheduledPillarSync() {
	await fetchAndUpsertPillars();
}
