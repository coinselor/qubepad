import { z } from "zod";
import { ZnnAddress } from "@/lib/znn-address";
import { isValidNostrPubkey } from "./nostr";

export const PILLAR_NAME_MAX_LENGTH = 40;
export const PILLAR_NAME_REGEX = /^([a-zA-Z0-9]+[-._]?)*[a-zA-Z0-9]$/;
export const PUBLIC_KEY_LENGTH = 64;
export const SIGNATURE_LENGTH = 128;

export const VALIDATION_MESSAGES = {
  PILLAR_NAME_REQUIRED: "Pillar name is required",
  PILLAR_NAME_MAX_LENGTH: `Pillar name cannot exceed ${PILLAR_NAME_MAX_LENGTH} characters`,
  PILLAR_NAME_PATTERN:
    "Pillar name can only contain letters, numbers, and single instances of hyphen, dot, or underscore between characters",
  PUBLIC_KEY_LENGTH:
    "Public key must be exactly 64 hexadecimal characters (32 bytes)",
  OWNER_ADDRESS_REQUIRED: "Owner address is required",
  WITHDRAW_ADDRESS_REQUIRED: "Withdraw address is required",
  PRODUCER_ADDRESS_REQUIRED: "Producer address is required",
  INVALID_ZENON_ADDRESS: "Must be a valid Zenon address",
  SIGNATURE_REQUIRED: "Signature is required",
  SIGNATURE_LENGTH:
    "Signature must be exactly 128 hexadecimal characters (64 bytes)",
  INVALID_HEX: "Must contain only hexadecimal characters (0-9 and a-f)",
  NOSTR_PUBKEY_REQUIRED: "Nostr public key is required",
  INVALID_NOSTR_PUBKEY: "Must be a valid Nostr public key (npub format)",
} as const;

export const pillarFormSchema = z.object({
  publicKey: z.string().refine(
    (val) => {
      if (val.length === PUBLIC_KEY_LENGTH) {
        return /^[0-9a-fA-F]+$/.test(val);
      }
      return false;
    },
    { message: VALIDATION_MESSAGES.PUBLIC_KEY_LENGTH }
  ),
  nostrPubkey: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.NOSTR_PUBKEY_REQUIRED })
    .refine(isValidNostrPubkey, {
      message: VALIDATION_MESSAGES.INVALID_NOSTR_PUBKEY,
    }),
  hqzName: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.PILLAR_NAME_REQUIRED })
    .max(PILLAR_NAME_MAX_LENGTH, {
      message: VALIDATION_MESSAGES.PILLAR_NAME_MAX_LENGTH,
    })
    .refine((val) => PILLAR_NAME_REGEX.test(val), {
      message: VALIDATION_MESSAGES.PILLAR_NAME_PATTERN,
    }),
  hqzOwnerAddress: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.OWNER_ADDRESS_REQUIRED })
    .refine((val) => ZnnAddress.isValid(val), {
      message: VALIDATION_MESSAGES.INVALID_ZENON_ADDRESS,
    }),
  hqzWithdrawAddress: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.WITHDRAW_ADDRESS_REQUIRED })
    .refine((val) => ZnnAddress.isValid(val), {
      message: VALIDATION_MESSAGES.INVALID_ZENON_ADDRESS,
    }),
  hqzProducerAddress: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.PRODUCER_ADDRESS_REQUIRED })
    .refine((val) => ZnnAddress.isValid(val), {
      message: VALIDATION_MESSAGES.INVALID_ZENON_ADDRESS,
    }),
  signature: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.SIGNATURE_REQUIRED })
    .refine((val) => /^[0-9a-fA-F]+$/.test(val), {
      message: VALIDATION_MESSAGES.INVALID_HEX,
    })
    .refine((val) => val.length === SIGNATURE_LENGTH, {
      message: VALIDATION_MESSAGES.SIGNATURE_LENGTH,
    }),
});

export type PillarFormSchema = z.infer<typeof pillarFormSchema>;
