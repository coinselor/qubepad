import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "next-themes";
import { Space_Mono, Roboto } from "next/font/google";

const spaceMono = Space_Mono({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-space-mono',
});

const roboto = Roboto({
	subsets: ['latin'],
	weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
	title: "Qubepad - HyperQube Registration Portal",
	description: "A launchpad for HyperQube-powered extension chains on Zenon Network.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${spaceMono.variable} ${roboto.className}`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={true}
					disableTransitionOnChange
				>

					<Providers>{children}</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
