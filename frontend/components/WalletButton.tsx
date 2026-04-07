"use client";

import { LoaderCircle, RefreshCcw, Wallet } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/stellar";

const FREIGHTER_INSTALL_URL = "https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk?hl=en";

export function WalletButton() {
	const { address, connect, error, hasFreighter, refresh, status } = useWallet();

	if (status === "checking") {
		return (
			<Button
				variant="outline"
				size="default"
				className="h-10 px-4.5 text-sm font-semibold"
				disabled
			>
				<LoaderCircle className="animate-spin" data-icon="inline-start" />
				Checking wallet
			</Button>
		);
	}

	if (address) {
		return (
			<Button
				variant="outline"
				size="default"
				className="h-10 px-4.5 text-sm font-semibold"
				onClick={() => void refresh()}
			>
				<RefreshCcw data-icon="inline-start" />
				{shortenAddress(address)}
			</Button>
		);
	}

	if (!hasFreighter && status === "idle") {
		return (
			<Button
				variant="outline"
				size="default"
				className="h-10 px-4.5 text-sm font-semibold"
				onClick={() => {
					if (typeof window !== "undefined") {
						window.open(FREIGHTER_INSTALL_URL, "_blank", "noopener,noreferrer");
					}
				}}
				title="Open the official Freighter installation guide."
			>
				<Wallet data-icon="inline-start" />
				Install Freighter
			</Button>
		);
	}

	return (
		<Button
			size="default"
			className="h-10 px-4.5 text-sm font-semibold"
			onClick={() => void connect()}
			title={error ?? "Connect your Freighter wallet"}
		>
			<Wallet data-icon="inline-start" />
			Connect Freighter
		</Button>
	);
}
