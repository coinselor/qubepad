"use client";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Weight } from "lucide-react";
import useSWR from "swr";
import { Pillar } from "@/types/Pillar";
import PillarIcon from "./ui/icons/pillar-icon";

export default function Dashboard() {
	const { data: pillars } = useSWR<Pillar[]>("/api/pillars");

	const stats = useMemo(() => {
		if (!pillars) return { registered: 0, total: 0, totalWeight: 0, registeredWeight: 0 };

		const registered = pillars.filter(p => p.status === "Registered").length;
		const total = pillars.length;
		const totalWeight = pillars.reduce((acc, p) => acc + Number(p.weight), 0);
		const registeredWeight = pillars
			.filter(p => p.status === "Registered")
			.reduce((acc, p) => acc + Number(p.weight), 0);

		return {
			registered,
			total,
			totalWeight,
			registeredWeight,
		};
	}, [pillars]);

	const formatWeight = (weight: number) => {
		const actualWeight = weight / 100000000;
		return `${(actualWeight / 1000000).toLocaleString(undefined, {
			maximumFractionDigits: 1,
			minimumFractionDigits: 1,
		})}M`;
	};

	return (
		<div className="w-full max-w-3xl mx-auto space-y-4 px-4 md:px-0">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Registered Pillars Card */}
				<Card className="p-6 bg-zinc-950 border-zinc-800 relative rounded-none">
					<div className="absolute -left-[10px] -top-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -top-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -left-[10px] -bottom-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -bottom-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -left-[10px] -top-[10px] w-[1px] h-[10px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -top-[10px] w-[1px] h-[10px] bg-zinc-800"></div>
					<div className="absolute -left-[10px] -bottom-[10px] w-[1px] h-[10px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -bottom-[10px] w-[1px] h-[10px] bg-zinc-800"></div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-zinc-400 font-mono lowercase">Registered Pillars</div>
								<div className="text-2xl font-space">
									<span className="text-green-500">{stats.registered}</span>/{stats.total}
								</div>
							</div>
							<PillarIcon className="h-8 w-8 text-zinc-700" />
						</div>
						<Progress value={(stats.registered / stats.total) * 100} className="h-1" />
					</div>
				</Card>

				{/* Support Weight Card */}
				<Card className="p-6 bg-zinc-950 border-zinc-800 relative rounded-none">
					<div className="absolute -left-[10px] -top-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -top-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -left-[10px] -bottom-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -bottom-[10px] w-[10px] h-[1px] bg-zinc-800"></div>
					<div className="absolute -left-[10px] -top-[10px] w-[1px] h-[10px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -top-[10px] w-[1px] h-[10px] bg-zinc-800"></div>
					<div className="absolute -left-[10px] -bottom-[10px] w-[1px] h-[10px] bg-zinc-800"></div>
					<div className="absolute -right-[10px] -bottom-[10px] w-[1px] h-[10px] bg-zinc-800"></div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-zinc-400 font-mono lowercase">Support Weight</div>
								<div className="text-2xl font-space">
									{formatWeight(stats.registeredWeight)}
								</div>
								<div className="text-sm text-zinc-500 font-space">
									{((stats.registeredWeight / stats.totalWeight) * 100).toFixed(1)}% of {formatWeight(stats.totalWeight)}
								</div>
							</div>
							<Weight className="h-8 w-8 text-zinc-700" />
						</div>
						<Progress
							value={(stats.registeredWeight / stats.totalWeight) * 100}
							className="h-1"
						/>
					</div>
				</Card>
			</div>
		</div>
	);
}
