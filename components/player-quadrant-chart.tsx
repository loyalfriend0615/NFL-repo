"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Info } from "lucide-react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
  ReferenceArea,
  ReferenceLine,
  Label as RechartsLabel,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

export function PlayerQuadrantChart({
  players,
  position,
  xMetric,
  yMetric,
  getMetricName,
  selectedPlayer,
  setSelectedPlayer,
}) {
  const [showLabels, setShowLabels] = useState(true)
  const [labelSize, setLabelSize] = useState([12])
  const [highlightElite, setHighlightElite] = useState(true)
  const [iconSize, setIconSize] = useState([6])

  // Calculate median values for the selected metrics to place reference lines
  const xValues = players.map((player) => player[xMetric])
  const yValues = players.map((player) => player[yMetric])
  const xMedian = xValues.sort((a, b) => a - b)[Math.floor(xValues.length / 2)]
  const yMedian = yValues.sort((a, b) => a - b)[Math.floor(yValues.length / 2)]

  // Get quadrant labels based on selected metrics
  const getQuadrantLabels = () => {
    if (xMetric === "manSeparation" && yMetric === "zoneSeparation") {
      return {
        // topLeft: "Zone Beaters",
        // topRight: "Elite Separators",
        // bottomLeft: "Struggles",
        // bottomRight: "Man Beaters",
      }
    }

    return {
      // topLeft: "High Y, Low X",
      // topRight: "High Y, High X",
      // bottomLeft: "Low Y, Low X",
      // bottomRight: "Low Y, High X",
    }
  }

  const quadrantLabels = getQuadrantLabels()

  // Update the handleDotClick function
  const handleDotClick = useCallback(
    (event) => {
      if (event && event.id) {
        setSelectedPlayer(event.id === selectedPlayer ? null : event.id)
      }
    },
    [selectedPlayer, setSelectedPlayer],
  )

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">2024 {position} Performance Quadrant</CardTitle>
        <CardDescription>
          Comparing {getMetricName(xMetric)} vs. {getMetricName(yMetric)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 h-full">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="labels">Show Names</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="elite" checked={highlightElite} onCheckedChange={setHighlightElite} />
              <Label htmlFor="elite">Highlight Elite</Label>
            </div>

            {showLabels && (
              <div className="flex items-center gap-2">
                <Label htmlFor="labelSize" className="min-w-20">
                  Label: {labelSize}
                </Label>
                <Slider
                  id="labelSize"
                  min={8}
                  max={16}
                  step={1}
                  value={labelSize}
                  onValueChange={setLabelSize}
                  className="w-[100px]"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Label htmlFor="iconSize" className="min-w-20">
                Icon: {iconSize}
              </Label>
              <Slider
                id="iconSize"
                min={3}
                max={12}
                step={1}
                value={iconSize}
                onValueChange={setIconSize}
                className="w-[100px]"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey={xMetric} name={getMetricName(xMetric)} domain={["auto", "auto"]}>
                  <RechartsLabel value={getMetricName(xMetric)} position="bottom" offset={20} />
                </XAxis>
                <YAxis type="number" dataKey={yMetric} name={getMetricName(yMetric)} domain={["auto", "auto"]}>
                  <RechartsLabel value={getMetricName(yMetric)} angle={-90} position="left" offset={40} />
                </YAxis>
                <ZAxis range={[iconSize[0] * 10, iconSize[0] * 10]} />

                <ReferenceLine x={xMedian} stroke="#666" strokeDasharray="3 3" />
                <ReferenceLine y={yMedian} stroke="#666" strokeDasharray="3 3" />

                <ReferenceArea x1={0} x2={xMedian} y1={yMedian} y2={1} fill="#f0f9ff" fillOpacity={0.3} />
                <ReferenceArea x1={xMedian} x2={1} y1={yMedian} y2={1} fill="#dcfce7" fillOpacity={0.3} />
                <ReferenceArea x1={0} x2={xMedian} y1={0} y2={yMedian} fill="#fee2e2" fillOpacity={0.3} />
                <ReferenceArea x1={xMedian} x2={1} y1={0} y2={yMedian} fill="#fef9c3" fillOpacity={0.3} />

                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />

                <Scatter
                  name="Players"
                  data={players}
                  fill="#8884d8"
                  shape={(props) =>
                    renderShape(
                      props,
                      showLabels,
                      labelSize[0],
                      highlightElite,
                      selectedPlayer,
                      iconSize[0],
                      handleDotClick,
                    )
                  }
                />

                <text
                  x={xMedian / 2}
                  y={yMedian + (1 - yMedian) / 2}
                  textAnchor="middle"
                  fill="#0369a1"
                  fontWeight="bold"
                >
                  {quadrantLabels.topLeft}
                </text>
                <text
                  x={xMedian + (1 - xMedian) / 2}
                  y={yMedian + (1 - yMedian) / 2}
                  textAnchor="middle"
                  fill="#059669"
                  fontWeight="bold"
                >
                  {quadrantLabels.topRight}
                </text>
                <text x={xMedian / 2} y={yMedian / 2} textAnchor="middle" fill="#b91c1c" fontWeight="bold">
                  {quadrantLabels.bottomLeft}
                </text>
                <text
                  x={xMedian + (1 - xMedian) / 2}
                  y={yMedian / 2}
                  textAnchor="middle"
                  fill="#ca8a04"
                  fontWeight="bold"
                >
                  {quadrantLabels.bottomRight}
                </text>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <h3 className="font-medium mb-1 flex items-center gap-2 text-sm">
              <Info className="h-4 w-4" />
              Analysis Insights
            </h3>
            <p className="text-xs text-muted-foreground">
              This quadrant chart divides players into four categories. Elite performers (top-right) excel in both
              metrics and are the most valuable for fantasy. Players in top-left and bottom-right may offer situational
              value.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom tooltip component
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const player = payload[0].payload

  return (
    <div className="bg-white p-3 border rounded-md shadow-md">
      <p className="font-bold">{player.name}</p>
      <p className="text-sm">Team: {player.team}</p>
      <div className="mt-2">
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            {entry.name}: {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{player.note}</p>
    </div>
  )
}

// Update the renderShape function to include the click handler
function renderShape(props, showLabels, labelSize, highlightElite, selectedPlayerId, baseIconSize, onClick) {
  const { cx, cy, payload } = props

  // Determine if player is "elite" (in top 25% for both metrics)
  const isElite = payload.isElite
  const isSelected = selectedPlayerId === payload.id

  // Calculate point size
  const size = isSelected ? baseIconSize * 1.67 : isElite && highlightElite ? baseIconSize * 1.33 : baseIconSize

  return (
    <g style={{ cursor: "pointer" }} onClick={() => onClick(payload)}>
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={isSelected ? "#10b981" : isElite && highlightElite ? "#f97316" : "#6366f1"}
        stroke={isSelected ? "#065f46" : isElite && highlightElite ? "#7c2d12" : "#4338ca"}
        strokeWidth={isSelected ? 2 : 1}
      />
      {showLabels && (
        <text
          x={cx}
          y={cy - size - 2}
          textAnchor="middle"
          fill={isSelected ? "#065f46" : "#000"}
          fontSize={isSelected ? labelSize + 1 : labelSize}
          fontWeight={isSelected || (isElite && highlightElite) ? "bold" : "normal"}
        >
          {payload.name}
        </text>
      )}
    </g>
  )
}

