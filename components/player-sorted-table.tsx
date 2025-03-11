"use client"

import { TableHeader } from "@/components/ui/table"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown } from "lucide-react"

export function PlayerSortedTable({ players, xMetric, yMetric, selectedPlayer, setSelectedPlayer }) {
  const [sortMetric, setSortMetric] = useState("overallRating")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter players by search query
  const filteredPlayers = useMemo(() => {
    return players.filter(
      (player) =>
        searchQuery === "" ||
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [players, searchQuery])

  // Sort players by selected metric
  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      const aValue = a[sortMetric]
      const bValue = b[sortMetric]

      if (sortDirection === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }, [filteredPlayers, sortMetric, sortDirection])

  // Toggle sort direction
  const toggleSort = (metric) => {
    if (sortMetric === metric) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortMetric(metric)
      setSortDirection("desc")
    }
  }

  // Handle player selection
  const handlePlayerSelect = (playerId) => {
    setSelectedPlayer(playerId === selectedPlayer ? null : playerId)
  }

  // Format metric value for display
  const formatMetricValue = (value, metric) => {
    if (value === undefined || value === null) {
      return "N/A"
    }
    if (metric === "catchRate" || metric === "targetShare") {
      return `${value.toFixed(1)}%`
    } else if (metric === "redZoneTargets" || metric.includes("Touchdowns") || metric.includes("Receptions")) {
      return Math.round(value)
    } else {
      return value.toFixed(2)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl">Player Rankings</CardTitle>
            <CardDescription>
              Sorted by {sortMetric} ({sortDirection === "desc" ? "highest first" : "lowest first"})
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-[150px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={sortMetric} onValueChange={setSortMetric}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overallRating">Overall Rating</SelectItem>
                <SelectItem value="manSeparation">Man Separation</SelectItem>
                <SelectItem value="zoneSeparation">Zone Separation</SelectItem>
                <SelectItem value="catchRate">Catch Rate</SelectItem>
                <SelectItem value="yardsPerRoute">Yards Per Route</SelectItem>
                <SelectItem value="targetShare">Target Share</SelectItem>
                <SelectItem value="redZoneTargets">Red Zone Targets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead className="w-[180px]">Player</TableHead>
                  <TableHead className="w-[100px]">Team</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => toggleSort(xMetric)}>
                    <div className="flex items-center justify-end">
                      {xMetric.charAt(0).toUpperCase() + xMetric.slice(1, 3)}
                      {sortMetric === xMetric && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => toggleSort(yMetric)}>
                    <div className="flex items-center justify-end">
                      {yMetric.charAt(0).toUpperCase() + yMetric.slice(1, 3)}
                      {sortMetric === yMetric && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer w-[100px]" onClick={() => toggleSort("catchRate")}>
                    <div className="flex items-center justify-end">
                      Catch %{sortMetric === "catchRate" && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer w-[100px]"
                    onClick={() => toggleSort("yardsPerRoute")}
                  >
                    <div className="flex items-center justify-end">
                      YPR
                      {sortMetric === "yardsPerRoute" && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer w-[100px]" onClick={() => toggleSort("targetShare")}>
                    <div className="flex items-center justify-end">
                      Target %{sortMetric === "targetShare" && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer w-[100px]"
                    onClick={() => toggleSort("overallRating")}
                  >
                    <div className="flex items-center justify-end">
                      Rating
                      {sortMetric === "overallRating" && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow
                    key={player.id}
                    className={`cursor-pointer ${player.id === selectedPlayer ? "bg-emerald-50 dark:bg-emerald-950" : ""}`}
                    onClick={() => handlePlayerSelect(player.id)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell className="text-right">{formatMetricValue(player[xMetric], xMetric)}</TableCell>
                    <TableCell className="text-right">{formatMetricValue(player[yMetric], yMetric)}</TableCell>
                    <TableCell className="text-right">{formatMetricValue(player.catchRate, "catchRate")}</TableCell>
                    <TableCell className="text-right">
                      {formatMetricValue(
                        player.yardsPerRoute || player.yardsPerCarry || player.yardsPerAttempt,
                        "yardsPerX",
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatMetricValue(player.targetShare, "targetShare")}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMetricValue(player.overallRating, "overallRating")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

