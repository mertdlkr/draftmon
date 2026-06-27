"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { TOURNAMENT_POOL_ABI } from "@/lib/contracts/abi";
import { CONTRACT_ADDRESS } from "@/constants";

export function useEnterRoom() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const enter = (contractRoomId: `0x${string}`, entryFee: bigint) => {
    writeContract({
      abi: TOURNAMENT_POOL_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "enter",
      args: [contractRoomId],
      value: entryFee,
    });
  };

  return { enter, hash, isPending, isConfirming, isSuccess, error };
}
