"use client";

import { useState } from "react";
import { waitForTransactionReceipt } from "@wagmi/core";
import { isAddress, parseUnits } from "viem";
import {
	useAccount,
	useConfig,
	useReadContract,
	useWriteContract,
} from "wagmi";
import { deployment } from "@/helpers/deployments";
import {
	GLOBAL_RELEASE_RULE,
	MILESTONE_RELEASE_RULE,
	REFUND_POLICY,
	RESOLVER_TYPE,
} from "@/lib/escrow";
import {
	contractsConfigured,
	fundingTokenAddress,
	fundingTokenConfigured,
	fundingTokenDecimals,
	fundingTokenSymbol,
	getEscrowConfig,
	getFundingTokenConfig,
	zeroAddress,
} from "@/lib/wagmi-helpers";
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
	recipientWallet: `0x${string}`;
	totalAmount: string;
	releaseType: string;
	refundPolicy: string;
	fundingWindow: string;
	selectedMediator: string;
	milestones: CreateMilestoneInput[];
};

function normalizeAmountValue(value: string) {
	return value.replace(/[^0-9.]/g, "");
}

type CreateMode = "draft" | "createAndFund";

export function useCreateEscrow({
	onSuccess,
}: {
	onSuccess?: (hash: `0x${string}`) => void;
} = {}) {
	const { address } = useAccount();
	const config = useConfig();
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isApproving, setIsApproving] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const { writeContractAsync } = useWriteContract();

	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		...getFundingTokenConfig("allowance", [
			address ?? zeroAddress,
			getEscrowConfig("createEscrow").address,
		]),
		query: {
			enabled:
				contractsConfigured && fundingTokenConfigured && Boolean(address),
		},
	});

	const parseAmountValue = (value: string) =>
		parseUnits(normalizeAmountValue(value) || "0", fundingTokenDecimals);

	const convertFundingWindowToDeadline = (windowValue: string) => {
		const hours = Number(windowValue.split(" ")[0] || "48");
		return BigInt(Math.floor(Date.now() / 1000) + hours * 60 * 60);
	};

	const parseDueDate = (value: string) => {
		const normalized = value.replace(/^Due\s+/, "");
		const parsed = new Date(`${normalized}, ${new Date().getFullYear()}`);
		if (Number.isNaN(parsed.getTime())) {
			return null;
		}
		return BigInt(Math.floor(parsed.getTime() / 1000));
	};

	const mapReleaseType = (value: string) => {
		return value === "Client approval + timeout"
			? GLOBAL_RELEASE_RULE.CLIENT_APPROVAL_AND_TIMEOUT
			: GLOBAL_RELEASE_RULE.DUAL_APPROVAL;
	};

	const mapRefundPolicy = (value: string) => {
		switch (value) {
			case "Mediator can split refund":
				return REFUND_POLICY.MEDIATOR_CAN_SPLIT_REFUND;
			case "Manual only":
				return REFUND_POLICY.MANUAL_ONLY;
			default:
				return REFUND_POLICY.ON_EXPIRY_IF_UNAPPROVED;
		}
	};

	const mapResolverType = (value: string) => {
		switch (value) {
			case "platform":
				return RESOLVER_TYPE.PLATFORM;
			case "independent":
				return RESOLVER_TYPE.INDEPENDENT;
			default:
				return RESOLVER_TYPE.NONE;
		}
	};

	const mapMilestoneTrigger = (value: string) => {
		switch (value) {
			case "Both parties approve":
				return MILESTONE_RELEASE_RULE.BOTH_PARTIES_APPROVE;
			case "Client approval or timeout":
				return MILESTONE_RELEASE_RULE.CLIENT_APPROVAL_OR_TIMEOUT;
			case "Client approval":
				return MILESTONE_RELEASE_RULE.CLIENT_APPROVAL;
			default:
				return MILESTONE_RELEASE_RULE.CUSTOM;
		}
	};

	const handleCreateEscrow = async (
		draft: CreateEscrowDraft,
		mode: CreateMode = deployment.chainId === 421614 ? "draft" : "createAndFund",
	) => {
		setErrorMessage("");
		setStatusMessage("");

		if (!address) {
			setErrorMessage("Connect a wallet before creating an escrow.");
			return;
		}

		if (!contractsConfigured) {
			setErrorMessage("Export the deployed escrow contracts into the web app first.");
			return;
		}

		if (!fundingTokenConfigured) {
			setErrorMessage(
				`Export a ${fundingTokenSymbol} token address before creating and funding escrows.`,
			);
			return;
		}

		if (!draft.title.trim() || !draft.clientName.trim() || !draft.recipientName.trim()) {
			setErrorMessage("Complete the escrow title and both party names first.");
			return;
		}

		if (!isAddress(draft.recipientWallet)) {
			setErrorMessage("Enter a valid recipient wallet address.");
			return;
		}

		if (draft.milestones.length === 0) {
			setErrorMessage("Add at least one milestone before creating the escrow.");
			return;
		}

		try {
			const totalAmount = parseAmountValue(draft.totalAmount);
			const milestonePayload = draft.milestones.map((milestone) => {
				const dueDate = parseDueDate(milestone.deadline);
				if (dueDate === null) {
					throw new Error(`Invalid milestone due date: ${milestone.deadline}`);
				}

				const releaseRule = mapMilestoneTrigger(milestone.trigger);
				return {
					title: milestone.title.trim(),
					description: milestone.description.trim(),
					amount: parseAmountValue(milestone.amount),
					dueDate,
					releaseRule,
					releaseCondition:
						releaseRule === MILESTONE_RELEASE_RULE.CUSTOM
							? milestone.trigger.trim()
							: "",
				};
			});
			const milestoneTotal = milestonePayload.reduce(
				(sum, milestone) => sum + milestone.amount,
				0n,
			);

			if (totalAmount <= 0n) {
				setErrorMessage(
					deployment.chainId === 421614
						? `Enter a small ${fundingTokenSymbol} test amount to continue.`
						: `Enter a ${fundingTokenSymbol} amount to continue.`,
				);
				return;
			}

			if (milestoneTotal !== totalAmount) {
				setErrorMessage("Milestone amounts must add up to the contract total.");
				return;
			}

			const allowanceValue = (allowance as bigint | undefined) ?? 0n;
			const shouldFundImmediately = mode === "createAndFund";

			if (shouldFundImmediately && allowanceValue < totalAmount) {
				setIsApproving(true);
				setStatusMessage(`Approving ${fundingTokenSymbol} spending...`);

				const approvalHash = await writeContractAsync({
					...getFundingTokenConfig("approve", [
						getEscrowConfig("createEscrow").address,
						totalAmount,
					]),
				});

				setIsApproving(false);
				setIsProcessing(true);
				await waitForTransactionReceipt(config, { hash: approvalHash });
				await refetchAllowance();
				setIsProcessing(false);
			}

			setIsCreating(true);
			setStatusMessage(
				shouldFundImmediately
					? "Creating and funding escrow onchain..."
					: "Creating escrow draft onchain...",
			);

			const hash = await writeContractAsync({
				...getEscrowConfig(
					shouldFundImmediately ? "createAndFundEscrow" : "createEscrow",
					[
					{
						title: draft.title.trim(),
						description: draft.description.trim(),
						clientName: draft.clientName.trim(),
						recipientName: draft.recipientName.trim(),
						recipient: draft.recipientWallet,
						token: fundingTokenAddress,
						totalAmount,
						fundingDeadline: convertFundingWindowToDeadline(draft.fundingWindow),
						defaultReleaseRule: mapReleaseType(draft.releaseType),
						refundPolicy: mapRefundPolicy(draft.refundPolicy),
						resolverType: mapResolverType(draft.selectedMediator),
					},
					milestonePayload,
				],
				),
			});

			setIsCreating(false);
			setIsProcessing(true);
			await waitForTransactionReceipt(config, { hash });
			setIsProcessing(false);
			setStatusMessage(
				shouldFundImmediately
					? "Escrow created and funded successfully."
					: "Escrow draft created successfully.",
			);
			onSuccess?.(hash);
		} catch (error) {
			setIsApproving(false);
			setIsCreating(false);
			setIsProcessing(false);
			setStatusMessage("");
			setErrorMessage(
				getUserFacingTransactionErrorMessage(error, fundingTokenSymbol),
			);
		}
	};

	return {
		handleCreateEscrow,
		isApproving,
		isCreating,
		isProcessing,
		statusMessage,
		errorMessage,
		fundingTokenConfigured,
		fundingTokenSymbol,
	};
}
