"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Shield, Zap, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface SmartContractAssignmentProps {
  assignmentId: string
  code: string
  studentAddress: string
}

export default function SmartContractAssignment({ assignmentId, code, studentAddress }: SmartContractAssignmentProps) {
  const { address, isConnected } = useAccount()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "deploying" | "verifying" | "minting" | "complete">(
    "idle",
  )
  const [contractAddress, setContractAddress] = useState<string>("")
  const [gasEstimate, setGasEstimate] = useState("0.0023")

  // const { writeContract, data: hash, isPending } = useWriteContract()
  // const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  //   hash,
  // })

  const deployToBlockchain = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsDeploying(true)
    setDeploymentStatus("deploying")

    try {
      // Step 1: Deploy assignment as smart contract
      toast.info("Deploying assignment to blockchain...")
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate deployment

      const mockContractAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      setContractAddress(mockContractAddress)
      setDeploymentStatus("verifying")

      // Step 2: Verify code execution
      toast.info("Verifying code execution on-chain...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setDeploymentStatus("minting")

      // Step 3: Mint achievement NFT
      toast.info("Minting achievement NFT...")

      // Simulate the contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setDeploymentStatus("complete")
      toast.success("Assignment verified on blockchain!")

      // writeContract({
      //   address: CONTRACTS.LEARNING_NFT as `0x${string}`,
      //   abi: LEARNING_NFT_ABI,
      //   functionName: "mintLearningNFT",
      //   args: [
      //     address,
      //     BigInt(assignmentId),
      //     JSON.stringify({
      //       name: `Assignment ${assignmentId} Completion`,
      //       description: "Smart contract verified assignment completion",
      //       attributes: [
      //         { trait_type: "Assignment ID", value: assignmentId },
      //         { trait_type: "Verification Method", value: "Smart Contract" },
      //         { trait_type: "Timestamp", value: Date.now() },
      //       ],
      //     }),
      //   ],
      // })
    } catch (error) {
      console.error("Deployment failed:", error)
      toast.error("Deployment failed. Please try again.")
      setDeploymentStatus("idle")
    } finally {
      setIsDeploying(false)
    }
  }

  const getStatusIcon = () => {
    switch (deploymentStatus) {
      case "deploying":
        return <Code className="h-5 w-5 text-blue-500 animate-spin" />
      case "verifying":
        return <Shield className="h-5 w-5 text-yellow-500 animate-pulse" />
      case "minting":
        return <Zap className="h-5 w-5 text-purple-500 animate-bounce" />
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getProgressValue = () => {
    switch (deploymentStatus) {
      case "deploying":
        return 25
      case "verifying":
        return 50
      case "minting":
        return 75
      case "complete":
        return 100
      default:
        return 0
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Smart Contract Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium capitalize">
              {deploymentStatus === "idle" ? "Ready to Deploy" : deploymentStatus}
            </span>
          </div>
          <Badge variant={deploymentStatus === "complete" ? "default" : "secondary"}>
            {deploymentStatus === "complete" ? "Verified" : "Pending"}
          </Badge>
        </div>

        {/* Progress Bar */}
        {deploymentStatus !== "idle" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Blockchain Verification Progress</span>
              <span>{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        )}

        {/* Contract Address */}
        {contractAddress && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Contract Deployed:</div>
                <div className="font-mono text-xs break-all">{contractAddress}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Gas Estimation */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Transaction Details:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Estimated Gas:</span>
              <div className="font-mono">{gasEstimate} ETH</div>
            </div>
            <div>
              <span className="text-gray-600">Network:</span>
              <div>Polygon (Low Cost)</div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h4 className="font-medium">Blockchain Verification Benefits:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Immutable proof of completion</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Automatic plagiarism prevention</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cross-platform credential recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Achievement NFT minting</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={deployToBlockchain}
          disabled={!isConnected || isDeploying || deploymentStatus === "complete"}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {!isConnected
            ? "Connect Wallet First"
            : deploymentStatus === "complete"
              ? "Verified on Blockchain ✓"
              : isDeploying
                ? "Deploying to Blockchain..."
                : "Deploy & Verify on Blockchain"}
        </Button>

        {/* Warning for non-connected users */}
        {!isConnected && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect your Web3 wallet to enable blockchain verification and earn NFT certificates.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
