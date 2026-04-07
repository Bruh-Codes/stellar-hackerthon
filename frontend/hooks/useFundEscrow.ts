"use client";

import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";

export function useFundEscrow({
	onSuccess,
}: {
	onSuccess?: (hash: `0x${string}`) => void | Promise<void>;
} = {}) {
	const { address } = useWallet();
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isApproving, setIsApproving] = useState(false);
	const [isFunding, setIsFunding] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const fundEscrow = async (_input?: {
		escrowId: bigint;
		totalAmount: bigint;
	}) => {
		setErrorMessage("");
		setStatusMessage("");

		if (!address) {
			setErrorMessage("Connect Freighter before funding the escrow.");
			return;
		}

		setIsFunding(true);
		setIsProcessing(true);
		setStatusMessage(
			"Funding is now expected to happen through the Stellar wallet path. Soroban funding hooks come next.",
		);

		await new Promise((resolve) => setTimeout(resolve, 400));

		setIsFunding(false);
		setIsProcessing(false);
		await onSuccess?.("0xstellarfundplaceholder" as `0x${string}`);
	};

	return {
		fundEscrow,
		isApproving,
		isFunding,
		isProcessing,
		statusMessage,
		errorMessage,
	};
}
