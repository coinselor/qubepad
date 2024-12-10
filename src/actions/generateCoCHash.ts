import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function generateCoCHash(length: number = 8): string {
	try {
		const filePath = join(process.cwd(), "CODE_OF_CONDUCT.md");
		const fileContent = readFileSync(filePath, "utf-8");
		const hash = createHash("sha256").update(fileContent).digest("hex");

		return hash.slice(0, length);
	} catch (error) {
		console.error("Error generating Code of Conduct hash:", error);
		return "INVALID";
	}
}
