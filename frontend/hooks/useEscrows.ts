"use client";

import { useAccount, useChainId, useReadContract } from "wagmi";
import {
	buildDashboardStats,
	mapEscrowView,
	type EscrowViewResult,
} from "@/lib/escrow";
import {
	contractsConfigured,
	deploymentChainId,
	getEscrowReaderConfig,
	zeroAddress,
} from "@/lib/wagmi-helpers";

export function useEscrows() {
	const { address, isConnected } = useAccount();
	const activeChainId = useChainId();

	const result = useReadContract({
		...getEscrowReaderConfig("getEscrowsForParticipant", [
			address ?? zeroAddress,
		]),
		query: {
			enabled: contractsConfigured && Boolean(address),
			staleTime: 0,
			refetchOnMount: true,
		},
	});

	const views = ((result.data as EscrowViewResult[] | undefined) ?? []).sort(
		(left, right) => Number(right.summary.createdAt - left.summary.createdAt),
	);

	return {
		...result,
		address,
		isConnected,
		activeChainId,
		isOnDeploymentChain: activeChainId === deploymentChainId,
		contractsConfigured,
		escrows: views.map(mapEscrowView),
		featuredStats: buildDashboardStats(views),
		hasEscrows: views.length > 0,
	};
}
