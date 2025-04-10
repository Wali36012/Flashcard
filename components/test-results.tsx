"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Clock,
  BarChart3,
  BookOpen,
  Brain,
  PenTool,
  SplitSquareVertical,
  Keyboard,
  Zap,
  Puzzle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import type { TestType } from "@/lib/db"
import confetti from "canvas-confetti"
import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface TestResultsProps {
  score: number
  totalPossible: number
  timeSpent: number
  testType: TestType
  onRetry: () => void
  onNewTest: () => void
  onExit: () => void
}

export default function TestResults({
  score,
  totalPossible,
  timeSpent,
  testType,
  onRetry,
  onNewTest,
  onExit,
}: TestResultsProps) {
  const confettiRef = useRef<HTMLDivElement>(null)
  const percentage = Math.round((score / totalPossible) * 100)
  const passed = percentage >= 70
  const { theme } = useTheme()

  useEffect(() => {
    // Trigger confetti for good performance
    if (percentage >= 70 && confettiRef.current) {
      const rect = confettiRef.current.getBoundingClientRect()
      confetti({
        particleCount: percentage >= 90 ? 150 : 100,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: theme === "dark" ? ["#818CF8", "#C4B5FD", "#E879F9"] : ["#4F46E5", "#7C3AED", "#EC4899"],
      })
    }
  }, [percentage, theme])

  const getTestTypeLabel = (type: TestType): string => {
    switch (type) {
      case "multipleChoice":
        return "Multiple Choice"
      case "fillBlank":
        return "Fill in the Blank"
      case "matching":
        return "Matching Pairs"
      case "spelling":
        return "Spelling Test"
      case "rapidFire":
        return "Rapid Fire"
      case "crossword":
        return "Word Puzzle"
      default:
        return "Test"
    }
  }

  const getTestTypeIcon = (type: TestType) => {
    switch (type) {
      case "multipleChoice":
        return <Brain className="h-3 w-3 mr-1" />
      case "fillBlank":
        return <PenTool className="h-3 w-3 mr-1" />
      case "matching":
        return <SplitSquareVertical className="h-3 w-3 mr-1" />
      case "spelling":
        return <Keyboard className="h-3 w-3 mr-1" />
      case "rapidFire":
        return <Zap className="h-3 w-3 mr-1" />
      case "crossword":
        return <Puzzle className="h-3 w-3 mr-1" />
      default:
        return <Brain className="h-3 w-3 mr-1" />
    }
  }

  try {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[100]">
        <div className="fixed inset-0 bg-black/50" onClick={onExit}></div>
        <div ref={confettiRef} className="w-full max-w-3xl relative z-[101]">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 dark:border-violet-800">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 text-transparent bg-clip-text">
                {percentage > 90
                  ? "Outstanding!"
                  : percentage > 75
                    ? "Great Job!"
                    : percentage > 60
                      ? "Good Work!"
                      : "Test Complete!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 dark:from-violet-600 dark:to-indigo-700 mb-4 relative">
                  <p className="text-4xl font-bold text-white">{percentage}%</p>
                </div>
                <p className="text-xl font-medium mt-2">
                  {score} / {totalPossible} points
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                  >
                    {getTestTypeIcon(testType)} {getTestTypeLabel(testType)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  >
                    <Clock className="h-3 w-3 mr-1" /> {timeSpent} seconds
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mt-4">
                  {percentage > 90
                    ? "Incredible performance! You've mastered these words! 🎉"
                    : percentage > 75
                      ? "Excellent work! Your vocabulary is expanding rapidly! 👏"
                      : percentage > 60
                        ? "Good job! Keep practicing to improve your score! 💪"
                        : "Keep learning and you'll improve your score with practice! 📚"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 dark:border dark:border-emerald-800 p-6 rounded-xl shadow-md"
                >
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-emerald-500" />
                    Score Analysis
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Score</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2 bg-emerald-100 dark:bg-emerald-900"
                      indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {percentage > 80
                        ? "Excellent mastery of the vocabulary!"
                        : percentage > 60
                          ? "Good understanding of most words."
                          : "Focus on reviewing the words you missed."}
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 dark:border dark:border-violet-800 p-6 rounded-xl shadow-md"
                >
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-violet-500" />
                    Performance
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-violet-500" />
                      <div>
                        <p className="font-medium">Time Spent</p>
                        <p className="text-sm text-muted-foreground">{timeSpent} seconds</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="font-medium">Test Type</p>
                        <p className="text-sm text-muted-foreground">{getTestTypeLabel(testType)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-2 pb-6">
              <Button
                onClick={onRetry}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 dark:from-violet-700 dark:to-indigo-700"
              >
                <Trophy className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Button
                onClick={onNewTest}
                variant="outline"
                className="w-full sm:w-auto border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/30"
              >
                <Brain className="mr-2 h-4 w-4" /> New Test Type
              </Button>
              <Button
                onClick={onExit}
                variant="outline"
                className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
              >
                <BookOpen className="mr-2 h-4 w-4" /> Back to Learning
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error rendering test results:", error);
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[100]">
        <div className="fixed inset-0 bg-black/50" onClick={onExit}></div>
        <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-md relative z-[101]">
          <div className="text-center p-4">
            <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Error Displaying Results</h3>
            <p className="text-muted-foreground mt-2">
              There was a problem displaying your test results.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={onRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={onExit}>
                Back to Flashcards
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
