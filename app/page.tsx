import FlashcardGame from "@/components/flashcard-game"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="min-h-screen bg-gradient-to-b from-white to-violet-50 dark:from-gray-950 dark:to-violet-950 py-8 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Dashboard</span>
            </Link>
          </div>
          <FlashcardGame />
        </div>
      </main>
    </ThemeProvider>
  )
}
