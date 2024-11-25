"use client";
import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SWRConfig
			value={{
				fetcher: (resource, init) =>
					fetch(resource, init).then((res) => res.json()),
				revalidateOnFocus: false,
				refreshInterval: 300000,
			}}
		>
			<TooltipProvider
				delayDuration={100}
				skipDelayDuration={300}
				disableHoverableContent
			>
				{children}
				<Toaster />
			</TooltipProvider>
		</SWRConfig>
	);
}
