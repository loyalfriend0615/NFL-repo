"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Info } from "lucide-react"

export function PlayerRadarChart({ players, selectedPlayer, getMetricName }) {
  const [roleDescription, setRoleDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Define the metrics to show in the radar chart
  const radarMetrics = [
    { key: "manSeparation", label: "Man Sep." },
    { key: "zoneSeparation", label: "Zone Sep." },
    { key: "catchRate", label: "Catch Rate" },
    { key: "yardsPerRoute", label: "YPR" },
    { key: "targetShare", label: "Target %" },
    { key: "redZoneTargets", label: "RZ Targets" },
  ]

  // Find the selected player
  const selectedPlayerData = useMemo(() => {
    return players.find((p) => p.id === selectedPlayer) || null
  }, [players, selectedPlayer])

  // Calculate average scores
  const averageScores = useMemo(() => {
    return radarMetrics.reduce((acc, metric) => {
      const sum = players.reduce((sum, player) => sum + (player[metric.key] || 0), 0)
      acc[metric.key] = sum / players.length
      return acc
    }, {})
  }, [players, radarMetrics])

  // Normalize data for radar chart to maximize visual differences
  const normalizedData = useMemo(() => {
    // For each metric, find min and max across all players
    const metricRanges = radarMetrics.reduce((acc, metric) => {
      const values = players.map((player) => player[metric.key])
      acc[metric.key] = {
        min: Math.min(...values),
        max: Math.max(...values),
      }
      return acc
    }, {})

    // Create normalized data for each player and average
    const playerData = {}
    players.forEach((player) => {
      playerData[player.id] = radarMetrics.reduce((acc, metric) => {
        const range = metricRanges[metric.key]
        const normalizedValue =
          range.max === range.min
            ? 0.5 // Handle case where all values are the same
            : (player[metric.key] - range.min) / (range.max - range.min)
        acc[metric.key] = normalizedValue
        return acc
      }, {})
    })

    // Add normalized average scores
    playerData["average"] = radarMetrics.reduce((acc, metric) => {
      const range = metricRanges[metric.key]
      const normalizedValue =
        range.max === range.min ? 0.5 : (averageScores[metric.key] - range.min) / (range.max - range.min)
      acc[metric.key] = normalizedValue
      return acc
    }, {})

    return playerData
  }, [players, radarMetrics, averageScores])

  // Format data for radar chart
  const radarData = useMemo(() => {
    return radarMetrics.map((metric) => ({
      metric: metric.label,
      fullMark: 1,
      average: normalizedData["average"][metric.key],
      ...(selectedPlayerData
        ? { [selectedPlayerData.id]: normalizedData[selectedPlayerData.id][metric.key] }
        : players.reduce((acc, player) => {
            acc[player.id] = normalizedData[player.id][metric.key]
            return acc
          }, {})),
    }))
  }, [players, radarMetrics, normalizedData, selectedPlayerData])

  // Calculate player rankings for each metric
  const playerRankings = useMemo(() => {
    if (!selectedPlayerData) return null

    return radarMetrics.map((metric) => {
      const sortedPlayers = [...players].sort((a, b) => b[metric.key] - a[metric.key])
      const rank = sortedPlayers.findIndex((p) => p.id === selectedPlayerData.id) + 1
      return {
        metric: getMetricName(metric.key),
        value: selectedPlayerData[metric.key],
        rank: rank,
        total: players.length,
        percentile: Math.round(((players.length - rank) / players.length) * 100),
      }
    })
  }, [selectedPlayerData, players, radarMetrics, getMetricName])

  // Fetch role description or generate overall analysis
  useEffect(() => {
    const fetchDescription = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Reduced simulation time for better UX

        let description = ""

        if (!selectedPlayerData) {
          // Generate overall analysis
          description =
            `This group of ${players.length} players shows diverse skill sets across various metrics. ` +
            `The average man separation is ${averageScores.manSeparation.toFixed(2)}, ` +
            `while the average zone separation is ${averageScores.zoneSeparation.toFixed(2)}. ` +
            `They demonstrate an average catch rate of ${averageScores.catchRate.toFixed(1)}% ` +
            `and generate ${averageScores.yardsPerRoute.toFixed(2)} yards per route run. ` +
            `On average, they command a ${averageScores.targetShare.toFixed(1)}% target share ` +
            `and see ${averageScores.redZoneTargets.toFixed(1)} red zone targets per season. ` +
            `This group offers a mix of specialists and well-rounded players, ` +
            `providing offensive coordinators with various options to exploit defensive weaknesses.`
        } else {
          // Generate player-specific description
          description = generatePlayerDescription(selectedPlayerData)
        }

        setRoleDescription(description)
      } catch (error) {
        console.error("Error fetching description:", error)
        setRoleDescription("Unable to generate description at this time.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDescription()
  }, [selectedPlayerData, players, averageScores, selectedPlayer])

  // Add this helper function to generate player-specific descriptions
  const generatePlayerDescription = (player) => {
    if (player.manSeparation > 0.3 && player.zoneSeparation > 0.25) {
      return `${player.name} is an elite route runner who creates separation against both man and zone coverage. This player would excel as a primary X receiver who can be moved around the formation to create mismatches. Their ability to get open against any coverage type makes them a quarterback's best friend and a true #1 option.`
    } else if (player.manSeparation > 0.3) {
      return `${player.name} specializes in beating man coverage with excellent release techniques and route running. This player would be most effective as an outside receiver who can win one-on-one matchups against cornerbacks. They would thrive in an offense that faces a lot of man coverage or in crucial third-down situations.`
    } else if (player.zoneSeparation > 0.25) {
      return `${player.name} excels at finding soft spots in zone coverage with great spatial awareness. This player would be ideal as a slot receiver or in a West Coast offense that emphasizes quick timing routes. Their ability to read defenses and settle in open areas makes them valuable for sustaining drives.`
    } else if (player.catchRate > 70) {
      return `${player.name} has exceptional hands and reliability as a pass catcher. This player would be perfect as a possession receiver who can be counted on in critical situations. Their consistency makes them valuable on third downs and in the red zone where reliability is paramount.`
    } else if (player.yardsPerRoute > 2.5) {
      return `${player.name} generates significant production per route run, indicating big-play ability. This player would excel as a deep threat who can stretch defenses vertically. Their efficiency makes them valuable in an offense that wants to create explosive plays downfield.`
    } else if (player.redZoneTargets > 20) {
      return `${player.name} is heavily targeted in the red zone, suggesting strong contested catch ability. This player would be most effective as a red zone specialist who can win jump balls and tight-window throws near the goal line. Their scoring potential makes them valuable for teams struggling to convert red zone opportunities into touchdowns.`
    } else {
      return `${player.name} shows balanced performance across multiple metrics without a single standout trait. This player would be effective as a complementary receiver who can fill multiple roles within an offense. Their versatility allows them to adapt to different game situations and coverage looks.`
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Player Radar Analysis</CardTitle>
        <CardDescription>
          {selectedPlayerData
            ? `Showing metrics for ${selectedPlayerData.name} (${selectedPlayerData.team})`
            : "Showing average metrics for all players"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Radar Chart */}
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius="70%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />

                  {/* Render all players as gray lines when no player is selected */}
                  {!selectedPlayerData &&
                    players.map((player) => (
                      <Radar
                        key={player.id}
                        name={player.name}
                        dataKey={player.id}
                        stroke="#9ca3af"
                        fill="transparent"
                        fillOpacity={0.1}
                        strokeWidth={1}
                      />
                    ))}

                  {/* Render average values */}
                  <Radar
                    name="Average"
                    dataKey="average"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />

                  {/* Render selected player if any */}
                  {selectedPlayerData && (
                    <Radar
                      name={selectedPlayerData.name}
                      dataKey={selectedPlayerData.id}
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics Display */}
            <div className="flex-1 min-w-0">
              <div className="border rounded-md p-3 h-full">
                <h3 className="font-medium text-sm mb-2">
                  {selectedPlayerData
                    ? `${selectedPlayerData.name} - Performance Metrics`
                    : "Average Performance Metrics"}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {radarMetrics.map((metric, index) => (
                    <div key={index} className="text-xs flex justify-between items-center">
                      <span className="font-medium">{getMetricName(metric.key)}:</span>
                      <span className="text-right">
                        {selectedPlayerData
                          ? `${selectedPlayerData[metric.key].toFixed(2)} (Rank: ${playerRankings[index].rank}/${playerRankings[index].total}, ${playerRankings[index].percentile}%)`
                          : averageScores[metric.key].toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Role Description or Overall Analysis */}
          <div className="border rounded-md p-3">
            <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {selectedPlayerData ? "Ideal Role Analysis" : "Overall Group Analysis"}
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{roleDescription}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

