import { PlayerDashboard } from "@/components/player-dashboard"

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <div className="p-4 md:p-6 bg-background border-b">
        <h1 className="text-3xl font-bold tracking-tight">NFL Player Performance Analysis</h1>
        <p className="text-muted-foreground">Advanced visualization tools for NFL player performance metrics</p>
      </div>

      <div className="flex-1">
        <PlayerDashboard />
      </div>
    </main>
  )
}

