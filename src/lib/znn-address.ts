import { SHA3 } from "sha3";
import { bech32 } from "bech32";

export class ZnnAddress {
	private static readonly PREFIX = "z";
	private static readonly ADDRESS_LENGTH = 40;
	private static readonly CORE_SIZE = 20;
	private static readonly USER_BYTE = 0;

	/**
	 * Converts a public key to a Zenon address
	 * @param publicKey - Buffer containing the public key
	 * @returns string - The bech32 encoded address
	 */
	static fromPublicKey(publicKey: Buffer): string {
		// Create SHA3-256 hasher
		const sha3 = new SHA3(256);
		sha3.update(publicKey);

		// Get first 19 bytes of hash
		const digest = sha3.digest().subarray(0, 19);

		// Create address core by prepending user byte
		const core = Buffer.concat([
			Buffer.from([this.USER_BYTE]),
			Buffer.from(digest),
		]);

		// Encode with bech32
		return bech32.encode(this.PREFIX, bech32.toWords(core));
	}

	/**
	 * Validates if a string is a valid Zenon address
	 * @param address - The address string to validate
	 * @returns boolean - True if address is valid
	 */
	static isValid(address: string): boolean {
		try {
			const decoded = this.parseAddress(address);
			return decoded.core.length === this.CORE_SIZE;
		} catch {
			return false;
		}
	}

	/**
	 * Verifies if a public key matches an address
	 * @param address - The address to verify
	 * @param publicKey - The public key to check against
	 * @returns boolean - True if the public key matches the address
	 */
	static verifyPublicKey(address: string, publicKey: Buffer): boolean {
		try {
			const derivedAddress = this.fromPublicKey(publicKey);
			return derivedAddress === address;
		} catch {
			return false;
		}
	}

	/**
	 * Parses a Zenon address string into its components
	 * @param address - The address string to parse
	 * @returns Object containing the address components
	 */
	private static parseAddress(address: string): {
		prefix: string;
		core: Buffer;
	} {
		const { prefix, words } = bech32.decode(address);

		if (prefix !== this.PREFIX) {
			throw new Error(
				`Invalid prefix ${prefix}; should be ${this.PREFIX}`
			);
		}

		const core = Buffer.from(bech32.fromWords(words));
		if (core.length !== this.CORE_SIZE) {
			throw new Error(
				`Invalid length ${core.length}; should be ${this.CORE_SIZE}`
			);
		}

		return { prefix, core };
	}
}
