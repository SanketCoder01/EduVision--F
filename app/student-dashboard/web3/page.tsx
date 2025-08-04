"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Coins, Trophy, Users, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"
import WalletConnect from "@/components/web3/wallet-connect"
import DAOGovernance from "@/components/web3/dao-governance"
import SmartContractAssignment from "@/components/web3/smart-contract-assignment"

export default function Web3Dashboard() {
  const [activeTab, setActiveTab] = useState("wallet")

  const features = [
    {
      icon: Wallet,
      title: "Web3 Wallet",
      description: "Connect your wallet to access blockchain features",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Coins,
      title: "EduTokens",
      description: "Earn and spend tokens for learning activities",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Trophy,
      title: "NFT Certificates",
      description: "Collect unique NFTs for your achievements",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Users,
      title: "DAO Governance",
      description: "Vote on platform decisions and proposals",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: "Smart Contracts",
      description: "Blockchain-verified assignment submissions",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Zap,
      title: "DeFi Learning",
      description: "Stake tokens to access premium content",
      color: "from-indigo-500 to-indigo-600",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Web3 Learning Hub
        </h1>
        <p className="text-xl text-gray-600">Experience the future of education with blockchain technology</p>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallet" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <Wallet className="h-4 w-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="nfts" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
            <Trophy className="h-4 w-4 mr-2" />
            NFTs
          </TabsTrigger>
          <TabsTrigger value="dao" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
            <Users className="h-4 w-4 mr-2" />
            DAO
          </TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
            <Shield className="h-4 w-4 mr-2" />
            Smart Contracts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="mt-6">
          <WalletConnect />
        </TabsContent>

        <TabsContent value="nfts" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Your NFT Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((nft) => (
                    <Card key={nft} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                          <Trophy className="h-12 w-12 text-white" />
                        </div>
                        <h4 className="font-semibold">Achievement #{nft}</h4>
                        <p className="text-sm text-gray-600">Completed Assignment</p>
                        <Badge className="mt-2">Rare</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dao" className="mt-6">
          <DAOGovernance />
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <div className="space-y-6">
            <SmartContractAssignment
              assignmentId="1"
              code="console.log('Hello Web3!');"
              studentAddress="0x1234567890123456789012345678901234567890"
            />

            <Card>
              <CardHeader>
                <CardTitle>Recent Smart Contract Deployments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "Assignment #1", status: "Verified", hash: "0xabc123...def456" },
                    { id: "Assignment #2", status: "Pending", hash: "0x789xyz...012abc" },
                    { id: "Assignment #3", status: "Verified", hash: "0x456def...789ghi" },
                  ].map((deployment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{deployment.id}</div>
                        <div className="text-sm text-gray-600 font-mono">{deployment.hash}</div>
                      </div>
                      <Badge variant={deployment.status === "Verified" ? "default" : "secondary"}>
                        {deployment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
