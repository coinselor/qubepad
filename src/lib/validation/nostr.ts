import { bech32 } from "bech32";

export function isValidNostrPubkey(pubkey: string): boolean {
  if (!pubkey.startsWith('npub')) return false;
  
  try {
    const decoded = bech32.decode(pubkey);
    
    if (decoded.prefix !== 'npub') {
      return false;
    }
    
    const data = bech32.fromWords(decoded.words);
    
    return data.length === 32;
  } catch (error) {
    return false;
  }
}
