"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Vote, Plus, TrendingUp, Clock, CheckCircle, X } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface Proposal {
  id: number
  title: string
  description: string
  proposer: string
  votesFor: number
  votesAgainst: number
  totalVotes: number
  status: "active" | "passed" | "rejected"
  timeLeft: string
  category: "curriculum" | "feature" | "governance"
}

export default function DAOGovernance() {
  const [proposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Add Web3 Development Course",
      description: "Introduce a comprehensive Web3 development course covering smart contracts, DeFi, and NFTs.",
      proposer: "0x1234...5678",
      votesFor: 1250,
      votesAgainst: 340,
      totalVotes: 1590,
      status: "active",
      timeLeft: "2 days",
      category: "curriculum",
    },
    {
      id: 2,
      title: "Implement Peer Review Rewards",
      description: "Students earn 10 EDU tokens for each quality peer review they provide.",
      proposer: "0x9876...4321",
      votesFor: 890,
      votesAgainst: 120,
      totalVotes: 1010,
      status: "passed",
      timeLeft: "Ended",
      category: "feature",
    },
    {
      id: 3,
      title: "Reduce Assignment Gas Fees",
      description: "Move assignment verification to Layer 2 to reduce transaction costs.",
      proposer: "0xABCD...EFGH",
      votesFor: 2100,
      votesAgainst: 450,
      totalVotes: 2550,
      status: "active",
      timeLeft: "5 days",
      category: "governance",
    },
  ])

  const [userVotingPower] = useState(125)
  const [showCreateProposal, setShowCreateProposal] = useState(false)
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    category: "feature",
  })

  const handleVote = (proposalId: number, support: boolean) => {
    toast.success(`Vote cast ${support ? "FOR" : "AGAINST"} proposal #${proposalId}`)
  }

  const handleCreateProposal = () => {
    if (!newProposal.title || !newProposal.description) {
      toast.error("Please fill in all fields")
      return
    }

    toast.success("Proposal created successfully!")
    setShowCreateProposal(false)
    setNewProposal({ title: "", description: "", category: "feature" })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "curriculum":
        return "bg-blue-100 text-blue-800"
      case "feature":
        return "bg-green-100 text-green-800"
      case "governance":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-800"
      case "passed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-500" />
            DAO Governance
          </h2>
          <p className="text-gray-600 mt-1">Participate in decentralized decision-making for EduVision</p>
        </div>

        <Dialog open={showCreateProposal} onOpenChange={setShowCreateProposal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title</Label>
                <Input
                  id="title"
                  placeholder="Enter proposal title"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newProposal.category}
                  onChange={(e) => setNewProposal((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="curriculum">Curriculum</option>
                  <option value="feature">Feature</option>
                  <option value="governance">Governance</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your proposal in detail..."
                  value={newProposal.description}
                  onChange={(e) => setNewProposal((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateProposal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProposal}>Create Proposal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Voting Power */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Voting Power</h3>
              <p className="text-sm text-gray-600">Based on your academic achievements and token holdings</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{userVotingPower}</div>
              <div className="text-sm text-gray-600">votes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Proposals */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Active Proposals</h3>

        {proposals.map((proposal) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{proposal.title}</h4>
                        <Badge className={getCategoryColor(proposal.category)}>{proposal.category}</Badge>
                        <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{proposal.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Proposed by: {proposal.proposer}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {proposal.timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Voting Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Voting Progress</span>
                      <span>{proposal.totalVotes} total votes</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>For: {proposal.votesFor}</span>
                        </div>
                        <span>{Math.round((proposal.votesFor / proposal.totalVotes) * 100)}%</span>
                      </div>
                      <Progress value={(proposal.votesFor / proposal.totalVotes) * 100} className="h-2" />

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500" />
                          <span>Against: {proposal.votesAgainst}</span>
                        </div>
                        <span>{Math.round((proposal.votesAgainst / proposal.totalVotes) * 100)}%</span>
                      </div>
                      <Progress value={(proposal.votesAgainst / proposal.totalVotes) * 100} className="h-2" />
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  {proposal.status === "active" && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVote(proposal.id, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, false)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Vote Against
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* DAO Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-gray-600">Total Proposals</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">1,847</div>
            <div className="text-sm text-gray-600">Active Voters</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Vote className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm text-gray-600">Participation Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
