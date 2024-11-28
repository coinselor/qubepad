"use client";
import { useState } from "react";

import { Input } from "./ui/input";
import { Search, Download, Loader, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import PillarTable from "@/components/PillarsTable";
import { exportPillars } from "@/actions/exportPillars";
import { fetchAndUpsertPillars } from "@/actions/fetchAndUpsertPillars";
import { useToast } from "@/hooks/use-toast";

export default function PillarsData() {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isExporting, setIsExporting] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const { toast } = useToast();

	const handleExport = async () => {
		try {
			setIsExporting(true);
			const result = await exportPillars();

			if (!result.success) {
				throw new Error(result.error);
			}

			if (result.data) {
				const csvContent = [
					// CSV Headers
					["Pillar Name", "Pillar Address", "Public Key", "Signature", "HQZ Name",
						"HQZ Owner", "HQZ Withdraw", "HQZ Producer", "Status", "Weight",
						"Created At", "Updated At", "Verified At"].join(","),
					// CSV Data
					...result.data.map(pillar => [
						pillar.alphanet_pillar_name,
						pillar.alphanet_pillar_address,
						pillar.alphanet_pillar_public_key,
						pillar.alphanet_pillar_signature,
						pillar.hqz_pillar_name,
						pillar.hqz_owner_address,
						pillar.hqz_withdraw_address,
						pillar.hqz_producer_address,
						pillar.status,
						pillar.weight,
						pillar.created_at,
						pillar.updated_at,
						pillar.verified_at
					].map(value => `"${value || ""}"`).join(","))
				].join("\n");

				const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `pillars_export_${new Date().toISOString().split("T")[0]}.csv`;
				try {
					document.body.appendChild(link);
					link.click();
				} finally {
					document.body.removeChild(link);
					setTimeout(() => {
						URL.revokeObjectURL(url);
					}, 100);
				}
				toast({
					title: "Export Successful",
					description: "The pillars data has been exported successfully.",
				});

			}
		} catch (error) {
			console.error("Export failed:", error);
			toast({
				title: "Export Failed",
				description: "Failed to export pillars data. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
		}
	};

	const syncPillars = async () => {
		if (isSyncing) return;
		try {
			setIsSyncing(true);
			await fetchAndUpsertPillars();
			toast({
				title: "Sync Successful",
				description: "Pillar data has been updated.",
			});
		} catch (error) {
			console.error("Sync failed:", error);
			toast({
				title: "Sync Failed",
				description: "Failed to sync pillar data. Will retry later.",
				variant: "destructive",
			});
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<div className="w-full max-w-3xl mx-auto mt-4 md:mt-8 px-4 md:px-0 space-y-4">
			<div className="w-full flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search pillars..."
						className="pl-8 w-full"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={syncPillars}
					disabled={true}
					title="Sync data"
					className="mr-2"
				>
					<RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={handleExport}
					disabled={isExporting}
					title="Export data"
				>
					{isExporting ? (
						<Loader className="h-4 w-4 animate-spin" />
					) : (
						<Download className="h-4 w-4" />
					)}
				</Button>
			</div>
			<div className="w-full">
				<PillarTable searchQuery={searchQuery} />
			</div>
		</div>
	);
}
