"use client";

import { useState } from "react";
import { signTransaction as freighterSignTransaction } from "@stellar/freighter-api";
import { useWallet } from "@/components/WalletProvider";
import { Client, networks } from "@/lib/soroban/trustblock-escrow-client/src";
import { storeEscrowId } from "@/lib/stellar-escrow-store";
import { getUserFacingTransactionErrorMessage } from "@/lib/transaction-errors";

type CreateMilestoneInput = {
	title: string;
	description: string;
	amount: string;
	trigger: string;
	deadline: string;
};

type CreateEscrowDraft = {
	title: string;
	description: string;
	clientName: string;
	recipientName: string;
	recipientWallet: string;
	totalAmount: string;
	releaseType: string;
	refundPolicy: string;
	fundingWindow: string;
	selectedMediator: string;
	milestones: CreateMilestoneInput[];
};

function isStellarAddress(value: string) {
	return value.startsWith("G") && value.length >= 20;
}

const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";

function sanitizeAmountInput(value: string) {
	return value.replace(/[^0-9.]/g, "");
}

function parseXlmAmountToStroops(value: string) {
	const normalized = sanitizeAmountInput(value);
	if (!normalized) {
		throw new Error("Each milestone needs an XLM amount.");
	}

	const [wholePart = "0", fractionPart = ""] = normalized.split(".");
	if (fractionPart.length > 7) {
		throw new Error("XLM amounts support up to 7 decimal places.");
	}

	const whole = wholePart === "" ? "0" : wholePart;
	const fraction = fractionPart.padEnd(7, "0");
	return BigInt(`${whole}${fraction}`);
}

export function useCreateEscrow({
	onSuccess,
}: {
	onSuccess?: (hash: string) => void;
} = {}) {
	const { address, networkPassphrase } = useWallet();
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isApproving, setIsApproving] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleCreateEscrow = async (
		draft: CreateEscrowDraft,
		_mode?: "draft" | "createAndFund",
	) => {
		setErrorMessage("");
		setStatusMessage("");

		if (!address) {
			setErrorMessage("Connect Freighter before creating an escrow.");
			return;
		}

		if (!draft.title.trim() || !draft.clientName.trim() || !draft.recipientName.trim()) {
			setErrorMessage("Complete the escrow title and both party names first.");
			return;
		}

		if (!isStellarAddress(draft.recipientWallet)) {
			setErrorMessage("Enter a valid Stellar recipient address.");
			return;
		}

		if (draft.milestones.length === 0) {
			setErrorMessage("Add at least one milestone before creating the escrow.");
			return;
		}

		if (networkPassphrase !== networks.testnet.networkPassphrase) {
			setErrorMessage("Switch Freighter to Stellar TESTNET before creating the escrow.");
			return;
		}

		try {
			setIsApproving(false);
			setIsCreating(true);
			setIsProcessing(true);
			setStatusMessage("Preparing the Soroban escrow transaction in Freighter...");

			const milestoneTitles = draft.milestones.map((milestone, index) => {
				const title = milestone.title.trim();
				return title || `Milestone ${index + 1}`;
			});
			const milestoneAmounts = draft.milestones.map((milestone) =>
				parseXlmAmountToStroops(milestone.amount),
			);

			const client = new Client({
				contractId: networks.testnet.contractId,
				networkPassphrase: networks.testnet.networkPassphrase,
				address,
				publicKey: address,
				rpcUrl: TESTNET_RPC_URL,
				signTransaction: freighterSignTransaction,
			} as ConstructorParameters<typeof Client>[0] & { address: string });

			const transaction = await client.create_escrow(
				{
					client: address,
					recipient: draft.recipientWallet,
					resolver: undefined,
					title: draft.title.trim(),
					milestone_titles: milestoneTitles,
					milestone_amounts: milestoneAmounts,
				},
				{
					address,
					publicKey: address,
					signTransaction: freighterSignTransaction,
				} as Parameters<typeof client.create_escrow>[1] & { address: string },
			);

			setStatusMessage("Approve the Soroban escrow transaction in Freighter.");

			const sentTransaction = await transaction.signAndSend({
				signTransaction: freighterSignTransaction,
				force: true,
			});
			const escrowId = sentTransaction.result;
			storeEscrowId(address, escrowId);

			setStatusMessage(
				`Soroban escrow #${escrowId.toString()} was created on Stellar testnet.`,
			);
			onSuccess?.(sentTransaction.sendTransactionResponse?.hash ?? escrowId.toString());
		} catch (error) {
			const userMessage = getUserFacingTransactionErrorMessage(error, "XLM");
			const detailedMessage =
				error instanceof Error
					? error.message
					: typeof error === "object" && error !== null && "message" in error
						? String(error.message)
						: "";
			setErrorMessage(
				userMessage === "The transaction could not be completed. Please try again." &&
					detailedMessage
					? detailedMessage
					: userMessage,
			);
			console.error("Create escrow failed", error);
		} finally {
			setIsCreating(false);
			setIsProcessing(false);
		}
	};

	return {
		handleCreateEscrow,
		isApproving,
		isCreating,
		isProcessing,
		statusMessage,
		errorMessage,
		fundingTokenConfigured: true,
		fundingTokenSymbol: "XLM",
	};
}
