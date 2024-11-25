type CurrentStats = {
	producedMomentums: number;
	expectedMomentums: number;
  };
  
  export type ApiPillar = {
	name: string;
	rank: number;
	type: number;
	ownerAddress: string;
	producerAddress: string;
	withdrawAddress: string;
	isRevocable: boolean;
	revokeCooldown: number; 
	revokeTimestamp: number; 
	giveMomentumRewardPercentage: number;
	giveDelegateRewardPercentage: number;
	currentStats: CurrentStats; 
	weight: string;
  };
  
  export type ApiPillarsResponse = {
	data: {
	  count: number; 
	  list: ApiPillar[]; 
	};
  };