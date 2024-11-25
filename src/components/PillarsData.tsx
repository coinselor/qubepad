"use client";
import { useState } from "react";

import { Input } from "./ui/input";
import { Search } from "lucide-react";
import PillarTable from "@/components/PillarsTable";

export default function PillarsData() {
	const [searchQuery, setSearchQuery] = useState<string>("");
	return (
		<div className="w-full max-w-3xl mx-auto mt-4 md:mt-8 px-4 md:px-0 space-y-4">
			<div className="w-full">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search pillars..."
						className="pl-8 w-full"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>
			<div className="w-full">
				<PillarTable searchQuery={searchQuery} />
			</div>
		</div>
	);
}
