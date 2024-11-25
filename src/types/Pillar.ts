export type Pillar = {
  alphanet_pillar_name: string;
  alphanet_pillar_address: string;
  alphanet_pillar_public_key: string | null;
  alphanet_pillar_signature: string | null;
  hqz_pillar_name?: string | null;
  hqz_owner_address?: string | null;
  hqz_withdraw_address?: string | null;
  hqz_producer_address?: string | null;
  status: 'Pending' | 'Registered';
  weight: bigint;
  created_at: Date;
  updated_at: Date;
  verified_at?: Date | null;
};
