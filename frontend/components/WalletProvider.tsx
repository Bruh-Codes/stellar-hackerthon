"use client";

import type { ReactNode } from "react";
import {
	createContext,
	startTransition,
	useContext,
	useEffect,
	useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	getAddress,
	getNetwork,
	isAllowed,
	isConnected,
	requestAccess,
} from "@stellar/freighter-api";

type WalletStatus = "idle" | "checking" | "connected" | "error";

type WalletContextValue = {
	address: string | null;
	error: string | null;
	hasFreighter: boolean;
	network: string | null;
	networkPassphrase: string | null;
	status: WalletStatus;
	connect: () => Promise<void>;
	refresh: () => Promise<void>;
	reset: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

async function loadWalletState() {
	const connection = await isConnected();
	if ("error" in connection && connection.error) {
		throw new Error(String(connection.error));
	}

	if (!("isConnected" in connection) || !connection.isConnected) {
		return {
			address: null,
			hasFreighter: false,
			network: null,
			networkPassphrase: null,
			status: "idle" as const,
		};
	}

	const allowed = await isAllowed();
	if ("error" in allowed && allowed.error) {
		throw new Error(String(allowed.error));
	}

	if (!("isAllowed" in allowed) || !allowed.isAllowed) {
		return {
			address: null,
			hasFreighter: true,
			network: null,
			networkPassphrase: null,
			status: "idle" as const,
		};
	}

	const [addressResult, networkResult] = await Promise.all([
		getAddress(),
		getNetwork(),
	]);

	if ("error" in addressResult && addressResult.error) {
		throw new Error(String(addressResult.error));
	}
	if ("error" in networkResult && networkResult.error) {
		throw new Error(String(networkResult.error));
	}

	return {
		address:
			"address" in addressResult && addressResult.address
				? addressResult.address
				: null,
		hasFreighter: true,
		network:
			"network" in networkResult && networkResult.network
				? networkResult.network
				: null,
		networkPassphrase:
			"networkPassphrase" in networkResult && networkResult.networkPassphrase
				? networkResult.networkPassphrase
				: null,
		status:
			"address" in addressResult && addressResult.address
				? ("connected" as const)
				: ("idle" as const),
	};
}

export function WalletProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	const [status, setStatus] = useState<WalletStatus>("checking");
	const [address, setAddress] = useState<string | null>(null);
	const [network, setNetwork] = useState<string | null>(null);
	const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);
	const [hasFreighter, setHasFreighter] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const syncWallet = async () => {
		setStatus("checking");
		setError(null);

		try {
			const next = await loadWalletState();
			startTransition(() => {
				setAddress(next.address);
				setHasFreighter(next.hasFreighter);
				setNetwork(next.network);
				setNetworkPassphrase(next.networkPassphrase);
				setStatus(next.status);
			});
		} catch (syncError) {
			const message =
				syncError instanceof Error
					? syncError.message
					: "Unable to reach Freighter.";

			startTransition(() => {
				setHasFreighter(false);
				setError(message);
				setStatus("error");
			});
		}
	};

	useEffect(() => {
		void syncWallet();
	}, []);

	const connect = async () => {
		setError(null);

		try {
			const connection = await isConnected();
			if ("error" in connection && connection.error) {
				throw new Error(String(connection.error));
			}
			if (!("isConnected" in connection) || !connection.isConnected) {
				throw new Error("Freighter extension was not detected in this browser.");
			}

			const access = await requestAccess();
			if ("error" in access && access.error) {
				throw new Error(String(access.error));
			}

			await syncWallet();
		} catch (connectError) {
			const message =
				connectError instanceof Error
					? connectError.message
					: "Wallet connection failed.";
			setError(message);
			setStatus("error");
		}
	};

	const reset = () => {
		setAddress(null);
		setHasFreighter(false);
		setNetwork(null);
		setNetworkPassphrase(null);
		setError(null);
		setStatus("idle");
	};

	return (
		<QueryClientProvider client={queryClient}>
			<WalletContext.Provider
				value={{
					address,
					error,
					hasFreighter,
					network,
					networkPassphrase,
					status,
					connect,
					refresh: syncWallet,
					reset,
				}}
			>
				{children}
			</WalletContext.Provider>
		</QueryClientProvider>
	);
}

export function useWallet() {
	const value = useContext(WalletContext);
	if (!value) {
		throw new Error("useWallet must be used inside WalletProvider");
	}
	return value;
}
