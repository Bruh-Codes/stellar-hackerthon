"use client";

import { useState } from "react";
import { waitForTransactionReceipt } from "@wagmi/core";
import {
	useAccount,
	useConfig,
	useReadContract,
	useWriteContract,
} from "wagmi";
import {
	contractsConfigured,
	fundingTokenConfigured,
	fundingTokenSymbol,
	getEscrowConfig,
	getFundingTokenConfig,
	zeroAddress,
} from "@/lib/wagmi-helpers";
import { getUserFacingTransactionErrorMessage } from "@/lib/transaction-errors";

export function useFundEscrow({
	onSuccess,
}: {
	onSuccess?: (hash: `0x${string}`) => void | Promise<void>;
} = {}) {
	const { address } = useAccount();
	const config = useConfig();
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isApproving, setIsApproving] = useState(false);
	const [isFunding, setIsFunding] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const { writeContractAsync } = useWriteContract();

	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		...getFundingTokenConfig("allowance", [
			address ?? zeroAddress,
			getEscrowConfig("fundEscrow").address,
		]),
		query: {
			enabled:
				contractsConfigured && fundingTokenConfigured && Boolean(address),
		},
	});

	const fundEscrow = async ({
		escrowId,
		totalAmount,
	}: {
		escrowId: bigint;
		totalAmount: bigint;
	}) => {
		setErrorMessage("");
		setStatusMessage("");

		if (!address) {
			setErrorMessage("Connect a wallet before funding the escrow.");
			return;
		}

		if (!contractsConfigured || !fundingTokenConfigured) {
			setErrorMessage("Deployment configuration is incomplete for funding.");
			return;
		}

		try {
			const allowanceValue = (allowance as bigint | undefined) ?? 0n;

			if (allowanceValue < totalAmount) {
				setIsApproving(true);
				setStatusMessage(`Approving ${fundingTokenSymbol} spending...`);

				const approvalHash = await writeContractAsync({
					...getFundingTokenConfig("approve", [
						getEscrowConfig("fundEscrow").address,
						totalAmount,
					]),
				});

				setIsApproving(false);
				setIsProcessing(true);
				await waitForTransactionReceipt(config, { hash: approvalHash });
				await refetchAllowance();
				setIsProcessing(false);
			}

			setIsFunding(true);
			setStatusMessage("Funding escrow onchain...");

			const hash = await writeContractAsync({
				...getEscrowConfig("fundEscrow", [escrowId]),
			});

			setIsFunding(false);
			setIsProcessing(true);
			await waitForTransactionReceipt(config, { hash });
			setIsProcessing(false);
			setStatusMessage("Escrow funded successfully.");
			await onSuccess?.(hash);
		} catch (error) {
			setIsApproving(false);
			setIsFunding(false);
			setIsProcessing(false);
			setStatusMessage("");
			setErrorMessage(
				getUserFacingTransactionErrorMessage(error, fundingTokenSymbol),
			);
		}
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
