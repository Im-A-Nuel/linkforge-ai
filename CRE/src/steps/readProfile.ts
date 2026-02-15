import {
  bytesToHex,
  cre,
  encodeCallMsg,
  getNetwork,
  LAST_FINALIZED_BLOCK_NUMBER,
  type Runtime,
} from "@chainlink/cre-sdk";
import { decodeFunctionResult, encodeFunctionData, type Address, zeroAddress } from "viem";
import { LINKFORGE_PROFILE_ABI, type WorkflowConfig } from "../utils/types";

export type ProfileSnapshot = {
  riskLevel: number;
  esgPriority: boolean;
  automationEnabled: boolean;
  lastRebalance: bigint;
};

type DecodedProfile = {
  0: number;
  1: boolean;
  2: boolean;
  3: bigint;
};

export const readUserProfile = (runtime: Runtime<WorkflowConfig>): ProfileSnapshot => {
  const { chainSelectorName, contractAddress, userAddress } = runtime.config.evm;
  const network = getNetwork({
    chainFamily: "evm",
    chainSelectorName,
    isTestnet: true,
  });

  if (!network) {
    throw new Error(`Unsupported chain selector: ${chainSelectorName}`);
  }

  const evmClient = new cre.capabilities.EVMClient(network.chainSelector.selector);
  const callData = encodeFunctionData({
    abi: LINKFORGE_PROFILE_ABI,
    functionName: "getProfile",
    args: [userAddress as Address],
  });

  const contractCall = evmClient
    .callContract(runtime, {
      call: encodeCallMsg({
        from: zeroAddress,
        to: contractAddress as Address,
        data: callData,
      }),
      blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
    })
    .result();

  const decoded = decodeFunctionResult({
    abi: LINKFORGE_PROFILE_ABI,
    functionName: "getProfile",
    data: bytesToHex(contractCall.data),
  }) as DecodedProfile;

  return {
    riskLevel: decoded[0],
    esgPriority: decoded[1],
    automationEnabled: decoded[2],
    lastRebalance: decoded[3],
  };
};
