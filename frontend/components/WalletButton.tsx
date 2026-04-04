"use client";

import { Button } from "@/components/ui/button";
import { walletConfigured } from "@/lib/wallet";
import AppKitButton from "./appkit-button";

export function WalletButton() {
	if (!walletConfigured) {
		return (
			<Button
				variant="outline"
				size="default"
				className="h-10 px-4.5 text-sm font-semibold"
				disabled
			>
				Set wallet env
			</Button>
		);
	}

	return <AppKitButton/>;
}
