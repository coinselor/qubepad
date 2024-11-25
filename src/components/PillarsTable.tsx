"use client";
import { useState } from "react";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "../components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, ShieldCheck } from "lucide-react";
import useSWR from "swr";
import { Pillar } from "../types/Pillar";
import RegistrationModal from "./RegistrationModal";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const formatWeight = (weight: number | bigint) => {
	const actualWeight = Number(weight) / 100000000;

	if (actualWeight >= 10000) {
		return `${Math.round(actualWeight / 1000)}K`;
	}
	return actualWeight.toLocaleString(undefined, {
		maximumFractionDigits: 2,
		minimumFractionDigits: 0
	});
};

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	}).format(new Date(date));
};

type PillarTableProps = {
	searchQuery: string;
};

export default function PillarsTable({ searchQuery }: PillarTableProps) {
	const {
		data: pillars,
		error,
		isLoading,
	} = useSWR<Pillar[]>("/api/pillars");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);

	if (error) return (
		<div className="flex items-center justify-center gap-2 text-red-500 p-4 bg-red-500/10 rounded-lg">
			<AlertCircle className="h-5 w-5" />
			<span>Error loading pillars: {error.message}</span>
		</div>
	);

	if (isLoading) return (
		<div className="relative w-[80%] mx-auto">
			<div className="space-y-3">
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-20 w-full" />
			</div>
		</div>
	);

	const filteredPillars = pillars?.filter((pillar) =>
		pillar.alphanet_pillar_name
			.toLowerCase()
			.includes(searchQuery.toLowerCase())
	);

	const handleRegisterClick = (pillar: Pillar) => {
		setSelectedPillar(pillar);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedPillar(null);
	};

	return (
		<div className="relative w-full">
			<div className="absolute -left-[10px] -top-[10px] w-[10px] h-[1px] bg-zinc-800 hidden md:block"></div>
			<div className="absolute -right-[10px] -top-[10px] w-[10px] h-[1px] bg-zinc-800 hidden md:block"></div>
			<div className="absolute -bottom-[10px] -right-[10px] w-[10px] h-[1px] bg-zinc-800 hidden md:block"></div>
			<div className="absolute -left-[10px] -bottom-[10px] w-[10px] h-[1px] bg-zinc-800 hidden md:block"></div>
			<div className="absolute -left-[10px] -top-[10px] w-[1px] h-[10px] bg-zinc-800 hidden md:block"></div>
			<div className="absolute -right-[10px] -top-[10px] w-[1px] h-[10px] bg-zinc-800 hidden md:block"></div>
			<div className="absolute -left-[10px] -bottom-[10px] w-[1px] h-[10px] bg-zinc-800 hidden md:block"></div>
			<div className="absolute -right-[10px] -bottom-[10px] w-[1px] h-[10px] bg-zinc-800 hidden md:block"></div>

			{/* Desktop Table View */}
			<div className="hidden md:block">
				<Table className="border border-zinc-800">
					<TableHeader className="lowercase font-mono [&_tr]:border-b-0 border-b border-zinc-800">
						<TableRow className="justify-center tracking-widest bg-zinc-950/80 dark:hover:bg-zinc-950/80 font-space">
							<TableHead className="text-center">Pillar</TableHead>
							<TableHead className="text-center">Weight</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-center">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="[&_tr]:border-b [&_tr]:border-zinc-800 [&_td]:border-x [&_td]:border-zinc-800">
						{filteredPillars?.map((pillar) => (
							<TableRow key={pillar.alphanet_pillar_name} className={`${pillar.status === 'Registered' ? 'bg-green-900/20 dark:hover:bg-green-900/30' : ''}`}>
								<TableCell className="font-space">{pillar.alphanet_pillar_name}</TableCell>
								<TableCell className="text-center font-space">{formatWeight(pillar.weight)}</TableCell>
								<TableCell className="text-center">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Badge
													variant={pillar.status === "Registered" ? "success" : "pending"}
													className="gap-1"
												>
													{pillar.status === "Registered" ? (
														<ShieldCheck className="h-3 w-3" />
													) : (
														<Clock className="h-3 w-3" />
													)}
													<span>{pillar.status.toUpperCase()}</span>
												</Badge>
											</TooltipTrigger>
											{pillar.status === "Registered" && (
												<TooltipContent>
													<p className="text-sm">
														Verified on {pillar.verified_at ? formatDate(pillar.verified_at) : "N/A"}
													</p>
												</TooltipContent>
											)}
										</Tooltip>
									</TooltipProvider>
								</TableCell>
								<TableCell className="flex items-center justify-center">
									<Button
										className="bg-buttonBg hover:bg-buttonHoverBg text-primary px-4 py-1 rounded"
										variant={`${pillar.status === "Registered" ? "outline" : "default"}`}
										onClick={() => handleRegisterClick(pillar)}
									>
										{pillar.status === "Registered" ? "Update" : "Register"}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-4">
				{filteredPillars?.map((pillar) => (
					<div
						key={pillar.alphanet_pillar_name}
						className={`p-4 rounded-lg border border-zinc-800 space-y-3 ${pillar.status === 'Registered' ? 'bg-green-900/20' : 'bg-zinc-950'
							}`}
					>
						<div className="flex justify-between items-center">
							<h3 className="font-space text-lg">{pillar.alphanet_pillar_name}</h3>
							<span className="font-space">{formatWeight(pillar.weight)}</span>
						</div>
						<div className="flex justify-between items-center">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Badge
											variant={pillar.status === "Registered" ? "success" : "pending"}
											className="gap-1"
										>
											{pillar.status === "Registered" ? (
												<ShieldCheck className="h-3 w-3" />
											) : (
												<Clock className="h-3 w-3" />
											)}
											<span>{pillar.status.toUpperCase()}</span>
										</Badge>
									</TooltipTrigger>
									{pillar.status === "Registered" && (
										<TooltipContent>
											<p className="text-sm">
												Verified on {pillar.verified_at ? formatDate(pillar.verified_at) : "N/A"}
											</p>
										</TooltipContent>
									)}
								</Tooltip>
							</TooltipProvider>
							<Button
								className="bg-buttonBg hover:bg-buttonHoverBg text-primary px-4 py-1 rounded"
								variant={`${pillar.status === "Registered" ? "outline" : "default"}`}
								onClick={() => handleRegisterClick(pillar)}
							>
								{pillar.status === "Registered" ? "Update" : "Register"}
							</Button>
						</div>
					</div>
				))}
			</div>

			{isModalOpen && selectedPillar && (
				<RegistrationModal
					pillar={selectedPillar}
					onClose={handleModalClose}
				/>
			)}
		</div>
	);
}
