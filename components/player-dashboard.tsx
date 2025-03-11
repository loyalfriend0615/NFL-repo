"use client"

import { useState } from "react"
import { PlayerQuadrantChart } from "@/components/player-quadrant-chart"
import { PlayerRadarChart } from "@/components/player-radar-chart"
import { PlayerSortedTable } from "@/components/player-sorted-table"
import { playerData } from "@/lib/player-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PlayerDashboard() {
  const [position, setPosition] = useState("WR")
  const [xMetric, setXMetric] = useState("manSeparation")
  const [yMetric, setYMetric] = useState("zoneSeparation")
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // Filter players by selected position
  const filteredPlayers = playerData.filter((player) => player.position === position)

  // Get metric display names
  const getMetricName = (metric) => {
    const metricNames = {
      manSeparation: "Separation vs. Man Coverage",
      zoneSeparation: "Separation vs. Zone Coverage",
      catchRate: "Catch Rate",
      yardsPerRoute: "Yards Per Route Run",
      targetShare: "Target Share %",
      redZoneTargets: "Red Zone Targets",
      overallRating: "Overall Rating",
    }
    return metricNames[metric] || metric
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-4 bg-background border-b">
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="QB">Quarterbacks</SelectItem>
            <SelectItem value="RB">Running Backs</SelectItem>
            <SelectItem value="WR">Wide Receivers</SelectItem>
            <SelectItem value="TE">Tight Ends</SelectItem>
          </SelectContent>
        </Select>

        <Select value={xMetric} onValueChange={setXMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="X-Axis Metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manSeparation">Man Separation</SelectItem>
            <SelectItem value="catchRate">Catch Rate</SelectItem>
            <SelectItem value="yardsPerRoute">Yards Per Route</SelectItem>
            <SelectItem value="targetShare">Target Share %</SelectItem>
            <SelectItem value="redZoneTargets">Red Zone Targets</SelectItem>
            <SelectItem value="overallRating">Overall Rating</SelectItem>
          </SelectContent>
        </Select>

        <Select value={yMetric} onValueChange={setYMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Y-Axis Metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zoneSeparation">Zone Separation</SelectItem>
            <SelectItem value="catchRate">Catch Rate</SelectItem>
            <SelectItem value="yardsPerRoute">Yards Per Route</SelectItem>
            <SelectItem value="targetShare">Target Share %</SelectItem>
            <SelectItem value="redZoneTargets">Red Zone Targets</SelectItem>
            <SelectItem value="overallRating">Overall Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Left half - Quadrant Chart */}
        <div className="lg:col-span-1">
          <PlayerQuadrantChart
            players={filteredPlayers}
            position={position}
            xMetric={xMetric}
            yMetric={yMetric}
            getMetricName={getMetricName}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
          />
        </div>

        {/* Right half - Radar Chart */}
        <div className="lg:col-span-1">
          <PlayerRadarChart players={filteredPlayers} selectedPlayer={selectedPlayer} getMetricName={getMetricName} />
        </div>
      </div>

      {/* Full width - Sorted Table */}
      <div className="p-4">
        <PlayerSortedTable
          players={filteredPlayers}
          xMetric={xMetric}
          yMetric={yMetric}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
        />
      </div>
    </div>
  )
}

