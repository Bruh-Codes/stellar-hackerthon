import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Manrope } from "next/font/google";

const manrope = Manrope({
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "TrustBlock | Programmable Escrow on Arbitrum",
	description:
		"Milestone escrow interface for secure contract payments on Arbitrum.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={manrope.className}>
			<body>
				<WalletProvider>
					<TooltipProvider>{children}</TooltipProvider>
				</WalletProvider>
			</body>
		</html>
	);
}
