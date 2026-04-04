"use client";

import { useState } from "react";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { fundingTokenSymbol, getEscrowConfig } from "@/lib/wagmi-helpers";
import { getUserFacingTransactionErrorMessage } from "@/lib/transaction-errors";

type ExecuteEscrowActionInput = {
	actionKey: string;
	functionName: string;
	args?: readonly unknown[];
	pendingMessage: string;
	successMessage: string;
	onSuccess?: (hash: `0x${string}`) => void | Promise<void>;
};

export function useEscrowAction() {
	const { address } = useAccount();
	const config = useConfig();
	const { writeContractAsync } = useWriteContract();
	const [activeActionKey, setActiveActionKey] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const executeEscrowAction = async ({
		actionKey,
		functionName,
		args,
		pendingMessage,
		successMessage,
		onSuccess,
	}: ExecuteEscrowActionInput) => {
		setErrorMessage("");
		setStatusMessage("");

		if (!address) {
			setErrorMessage("Connect a wallet before continuing.");
			return false;
		}

		try {
			setActiveActionKey(actionKey);
			setStatusMessage(pendingMessage);

			const hash = await writeContractAsync({
				...getEscrowConfig(functionName, args),
			});

			await waitForTransactionReceipt(config, { hash });
			setStatusMessage(successMessage);
			await onSuccess?.(hash);
			return true;
		} catch (error) {
			setStatusMessage("");
			setErrorMessage(
				getUserFacingTransactionErrorMessage(error, fundingTokenSymbol),
			);
			return false;
		} finally {
			setActiveActionKey(null);
		}
	};

	return {
		executeEscrowAction,
		activeActionKey,
		isProcessing: activeActionKey !== null,
		statusMessage,
		errorMessage,
		clearActionFeedback: () => {
			setStatusMessage("");
			setErrorMessage("");
		},
	};
}
