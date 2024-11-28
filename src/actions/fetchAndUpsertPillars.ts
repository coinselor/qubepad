"use server";

import { ApiPillarsResponse } from "@/types/ZenonHubResponse";
import { db } from "../db/db";
import { pillarsTable } from "../db/schema";
import { Pillar } from "../types/Pillar";

function base64ToHex(base64: string): string {
  const raw = Buffer.from(base64, 'base64');
  return raw.toString('hex');
}

interface FrontierAccountBlockResponse {
  data: {
    publicKey: string;
  };
}

export async function fetchAndUpsertPillars() {
	try {
		const response = await fetch("https://zenonhub.io/api/nom/pillars/get-all");
		
		if (!response.ok) {
			throw new Error(`Failed to fetch pillars: ${response.status} ${response.statusText}`);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error("Expected JSON response but received: " + contentType);
		}

		const data: ApiPillarsResponse = await response.json();
		const pillars: Partial<Pillar>[] = [];

		// First, get all existing pillars with their public keys
		const existingPillars = await db
			.select({
				name: pillarsTable.alphanet_pillar_name,
				publicKey: pillarsTable.alphanet_pillar_public_key
			})
			.from(pillarsTable);

		const existingPublicKeys = new Map(
			existingPillars.map(p => [p.name, p.publicKey])
		);

		for (const pillar of data.data.list) {
			try {
				let publicKeyHex = existingPublicKeys.get(pillar.name) || null;

				// Only fetch frontier data if we don't have the public key
				if (!publicKeyHex) {
					// Fetch the frontier account block to get the public key
					const frontierResponse = await fetch(
						`https://zenonhub.io/api/nom/ledger/get-frontier-account-block?address=${pillar.ownerAddress}`
					);

					if (!frontierResponse.ok) {
						console.error(`Failed to fetch frontier data for ${pillar.name}: ${frontierResponse.status} ${frontierResponse.statusText}`);
						continue;
					}

					const contentType = frontierResponse.headers.get("content-type");
					if (!contentType || !contentType.includes("application/json")) {
						console.error(`Expected JSON response for frontier data but received: ${contentType}`);
						continue;
					}

					const frontierData: FrontierAccountBlockResponse = await frontierResponse.json();
					publicKeyHex = frontierData.data.publicKey ?
						base64ToHex(frontierData.data.publicKey) :
						null;
				}

				pillars.push({
					alphanet_pillar_name: pillar.name,
					alphanet_pillar_address: pillar.ownerAddress,
					weight: BigInt(pillar.weight),
					alphanet_pillar_public_key: publicKeyHex,
					updated_at: new Date(),
				});
			} catch (error) {
				console.error(`Error processing pillar ${pillar.name}:`, error);
				continue;
			}
		}

		// Only proceed with DB operations if we have pillars to update
		if (pillars.length > 0) {
			for (const pillar of pillars) {
				await db
					.insert(pillarsTable)
					.values(pillar as Required<Pick<Pillar, 'alphanet_pillar_name' | 'alphanet_pillar_address' | 'weight' | 'alphanet_pillar_public_key' | 'updated_at'>>)
					.onConflictDoUpdate({
						target: pillarsTable.alphanet_pillar_name,
						set: {
							weight: pillar.weight,
							alphanet_pillar_public_key: pillar.alphanet_pillar_public_key,
							updated_at: pillar.updated_at,
						},
					});
			}
		}
	} catch (error) {
		console.error("Error fetching and upserting pillars:", error);
	}
}

export async function scheduledPillarSync() {
	await fetchAndUpsertPillars();
}
