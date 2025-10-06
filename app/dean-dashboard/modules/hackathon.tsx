"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Plus, Trophy, Users, Award } from "lucide-react"

export default function HackathonModule() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Hackathon Management</h2>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Hackathon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">5</div>
            <div className="text-sm text-gray-600">Active Hackathons</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">342</div>
            <div className="text-sm text-gray-600">Total Participants</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">127</div>
            <div className="text-sm text-gray-600">Projects Submitted</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">₹2.5L</div>
            <div className="text-sm text-gray-600">Total Prizes</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2 text-red-600" />
              Active Hackathons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "AI Innovation Challenge", theme: "Artificial Intelligence", participants: 85, prize: "₹50,000", status: "Ongoing" },
                { title: "Blockchain Hackathon", theme: "Web3 & DeFi", participants: 67, prize: "₹75,000", status: "Registration Open" },
                { title: "IoT Solutions", theme: "Internet of Things", participants: 43, prize: "₹30,000", status: "Starting Soon" },
                { title: "Cybersecurity Challenge", theme: "Security & Privacy", participants: 92, prize: "₹60,000", status: "Ongoing" }
              ].map((hackathon, index) => (
                <div key={hackathon.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{hackathon.title}</h4>
                    <p className="text-sm text-gray-600">{hackathon.theme}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{hackathon.participants} participants</span>
                      <span>{hackathon.prize} prize</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    hackathon.status === "Ongoing" ? "bg-green-50 text-green-700 border-green-200" :
                    hackathon.status === "Registration Open" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }>
                    {hackathon.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { team: "CodeCrushers", project: "Smart Campus App", score: 98, prize: "1st Place", hackathon: "AI Innovation" },
                { team: "TechTitans", project: "Blockchain Voting", score: 95, prize: "2nd Place", hackathon: "Blockchain Hackathon" },
                { team: "DataDynamos", project: "IoT Health Monitor", score: 92, prize: "3rd Place", hackathon: "IoT Solutions" },
                { team: "CyberShield", project: "Security Scanner", score: 89, prize: "Best Innovation", hackathon: "Cybersecurity" }
              ].map((performer, index) => (
                <div key={performer.team} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{performer.team}</h4>
                      <p className="text-sm text-gray-600">{performer.project}</p>
                      <p className="text-xs text-gray-500">{performer.hackathon}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-600">{performer.score}</div>
                    <div className="text-xs text-gray-500">{performer.prize}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
