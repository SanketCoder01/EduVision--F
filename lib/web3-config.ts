import { createConfig } from "wagmi"
import { mainnet, polygon, arbitrum, sepolia } from "wagmi/chains"
import { injected, metaMask, walletConnect } from "wagmi/connectors"

const projectId = "your-walletconnect-project-id"

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, sepolia],
  connectors: [injected(), metaMask(), walletConnect({ projectId })],
})

// Smart Contract Addresses
export const CONTRACTS = {
  LEARNING_NFT: "0x1234567890123456789012345678901234567890",
  EDU_TOKEN: "0x0987654321098765432109876543210987654321",
  ASSIGNMENT_VERIFIER: "0x1111222233334444555566667777888899990000",
  DAO_GOVERNANCE: "0xAAAABBBBCCCCDDDDEEEEFFFF0000111122223333",
}

// ABI definitions
export const LEARNING_NFT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "courseId", type: "uint256" },
      { name: "metadata", type: "string" },
    ],
    name: "mintLearningNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "updateProgress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

export const EDU_TOKEN_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const
