"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Coins, Trophy, Users } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })

  const [eduTokenBalance, setEduTokenBalance] = useState("0")
  const [nftCount, setNftCount] = useState(0)
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    if (isConnected && address) {
      // Simulate fetching Web3 data
      setEduTokenBalance("1,250")
      setNftCount(5)
      setAchievements([
        { id: 1, name: "First Assignment", rarity: "Common" },
        { id: 2, name: "Code Master", rarity: "Rare" },
        { id: 3, name: "Peer Helper", rarity: "Epic" },
      ])

      toast.success("Web3 wallet connected successfully!")
    }
  }, [isConnected, address])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800"
      case "Rare":
        return "bg-blue-100 text-blue-800"
      case "Epic":
        return "bg-purple-100 text-purple-800"
      case "Legendary":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Web3 Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Connect your wallet to access Web3 features like NFT certificates, EduTokens, and DAO voting.
          </p>

          <div className="space-y-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className="w-full"
                variant="outline"
              >
                {isPending ? "Connecting..." : `Connect ${connector.name}`}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Web3 Wallet
            </div>
            <Button variant="outline" size="sm" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Address:</span>
            <Badge variant="outline">{formatAddress(address!)}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ETH Balance:</span>
            <span className="font-mono">{balance?.formatted.slice(0, 8)} ETH</span>
          </div>
        </CardContent>
      </Card>

      {/* EduToken Balance */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            EduToken Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{eduTokenBalance} EDU</div>
          <p className="text-sm text-gray-600 mt-1">Earn more tokens by completing assignments and helping peers!</p>
        </CardContent>
      </Card>

      {/* NFT Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Learning NFTs ({nftCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{achievement.name}</span>
                </div>
                <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DAO Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            DAO Participation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Voting Power:</span>
              <Badge>125 votes</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Proposals Created:</span>
              <Badge variant="outline">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Votes Cast:</span>
              <Badge variant="outline">12</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
