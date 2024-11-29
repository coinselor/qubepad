"use client";
import { SWRConfig } from "swr";
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
			{children}
			<Toaster />
		</SWRConfig>
	);
}
