"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppKitProvider } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { walletConfig, walletWagmiConfig } from "@/lib/wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<WagmiProvider config={walletWagmiConfig}>
			<QueryClientProvider client={queryClient}>
				{walletConfig ? (
					<AppKitProvider {...walletConfig}>{children}</AppKitProvider>
				) : (
					children
				)}
			</QueryClientProvider>
		</WagmiProvider>
	);
}
