import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a hex string to a Buffer
 * @param hex - The hex string to convert (with or without '0x' prefix)
 * @returns Buffer
 * @throws Error if the input is not a valid hex string or has invalid length
 */
export function hexToBuffer(hex: string): Buffer {
	// Remove '0x' prefix if present
	const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;

	// Check if the string contains only valid hex characters
	if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
	  throw new Error('Invalid hex string');
	}

	// Ensure even length
	if (cleanHex.length % 2 !== 0) {
	  throw new Error('Hex string must have an even number of characters');
	}

	// For Zenon public keys, validate length (32 bytes = 64 hex chars)
	if (cleanHex.length !== 64) {
	  throw new Error('Invalid public key length - must be 32 bytes (64 hex characters)');
	}

	return Buffer.from(cleanHex, 'hex');
  }
