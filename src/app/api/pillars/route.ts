import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { pillarsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ZnnAddress } from "@/lib/znn-address";
import { hexToBuffer } from "@/lib/utils";
import { config } from "@/lib/config";
import { isValidNostrPubkey } from "@/lib/validation/nostr";

export async function GET() {
	const pillars = await db
		.select()
		.from(pillarsTable)
		.orderBy(desc(pillarsTable.weight));
	const serializedPillars = pillars.map((pillar) => ({
		...pillar,
		weight: pillar.weight.toString(),
		created_at: pillar.created_at.toISOString(),
		updated_at: pillar.updated_at.toISOString(),
	}));
	return NextResponse.json(serializedPillars);
}

export async function PUT(request: Request) {
	try {
		const { pillarName, data } = await request.json();

		const pillar = await db
			.select()
			.from(pillarsTable)
			.where(eq(pillarsTable.alphanet_pillar_name, pillarName))
			.limit(1);

		if (!pillar || pillar.length === 0) {
			return NextResponse.json(
				{ error: "Pillar not found" },
				{ status: 404 }
			);
		}

		try {
			const pubKeyBuffer = hexToBuffer(data.publicKey);
			if (
				!ZnnAddress.verifyPublicKey(
					pillar[0].alphanet_pillar_address,
					pubKeyBuffer
				)
			) {
				return NextResponse.json(
					{ error: "Public key does not match pillar's address" },
					{ status: 400 }
				);
			}
		} catch (error) {
			console.error("Invalid public key format:", error);
			return NextResponse.json(
				{ error: "Invalid public key format" },
				{ status: 400 }
			);
		}

		if (data.nostr_pubkey && !isValidNostrPubkey(data.nostr_pubkey)) {
			return NextResponse.json(
				{ error: "Invalid Nostr public key format" },
				{ status: 400 }
			);
		}

		const messageString = `${pillarName} ${data.hqz_pillar_name} ${data.hqz_owner_address} ${data.hqz_withdraw_address} ${data.hqz_producer_address} ${data.nostr_pubkey} ${config.signature.messageSuffix}`;

		const verifyResponse = await fetch(
			"https://zenonhub.io/api/utilities/verify-signed-message",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					public_key: data.publicKey,
					message: messageString,
					signature: data.signature,
					address: pillar[0].alphanet_pillar_address,
				}),
			}
		);

		const verifyResult = await verifyResponse.json();

		if (!verifyResponse.ok || !verifyResult.data) {
			return NextResponse.json(
				{ error: "Invalid signature" },
				{ status: 400 }
			);
		}

		try {
			await db
				.update(pillarsTable)
				.set({
					hqz_pillar_name: data.hqz_pillar_name,
					hqz_owner_address: data.hqz_owner_address,
					hqz_withdraw_address: data.hqz_withdraw_address,
					hqz_producer_address: data.hqz_producer_address,
					nostr_pubkey: data.nostr_pubkey,
					alphanet_pillar_public_key: data.publicKey,
					alphanet_pillar_signature: data.signature,
					status: "Registered",
					verified_at: new Date(),
					updated_at: new Date(),
				})
				.where(eq(pillarsTable.alphanet_pillar_name, pillarName));

			return NextResponse.json({
				message: "Pillar updated successfully",
				pillarName: pillar[0].alphanet_pillar_name,
			});
		} catch (error) {
			console.error("Database update error:", error);
			return NextResponse.json(
				{ error: "Failed to update pillar data" },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Server error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
