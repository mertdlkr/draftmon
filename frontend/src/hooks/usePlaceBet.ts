"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { TOURNAMENT_POOL_ABI } from "@/lib/contracts/abi";
import { CONTRACT_ADDRESS } from "@/constants";

export function usePlaceBet() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const placeBet = (contractRoomId: `0x${string}`, target: `0x${string}`, amount: bigint) => {
    writeContract({
      abi: TOURNAMENT_POOL_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "placeBet",
      args: [contractRoomId, target],
      value: amount,
    });
  };

  return { placeBet, hash, isPending, isConfirming, isSuccess, error };
}
