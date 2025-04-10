"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, PenTool, SplitSquareVertical, Keyboard, Zap, Puzzle, Clock } from "lucide-react"
import { motion } from "framer-motion"
import type { TestType } from "@/lib/db"

interface TestSelectorProps {
  onSelectTest: (testType: TestType, difficulty: "easy" | "medium" | "hard") => void
  onCancel: () => void
}

export default function TestSelector({ onSelectTest, onCancel }: TestSelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  
  // Add a refresh function to ensure tests use the latest words
  const [refreshKey, setRefreshKey] = useState(0)

  // Define available test types
  const testTypes = [
    {
      id: "multipleChoice" as TestType,
      title: "Multiple Choice",
      description: "Select the correct definition from options",
      icon: <Brain className="h-6 w-6" />,
      color: "from-violet-500 to-indigo-500",
      available: true,
    },
    {
      id: "fillBlank" as TestType,
      title: "Fill in the Blank",
      description: "Complete sentences with the correct word",
      icon: <PenTool className="h-6 w-6" />,
      color: "from-indigo-500 to-blue-500",
      available: true,
    },
    {
      id: "matching" as TestType,
      title: "Matching Pairs",
      description: "Match words with their definitions",
      icon: <SplitSquareVertical className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      available: true,
    },
    {
      id: "spelling" as TestType,
      title: "Spelling Test",
      description: "Type the word from its definition",
      icon: <Keyboard className="h-6 w-6" />,
      color: "from-emerald-500 to-teal-500",
      available: true,
    },
    {
      id: "rapidFire" as TestType,
      title: "Rapid Fire",
      description: "Quick word recognition under time pressure",
      icon: <Zap className="h-6 w-6" />,
      color: "from-amber-500 to-orange-500",
      available: true,
    },
    {
      id: "crossword" as TestType,
      title: "Word Puzzle",
      description: "Solve a crossword puzzle using definitions",
      icon: <Puzzle className="h-6 w-6" />,
      color: "from-rose-500 to-pink-500",
      available: false,
    },
  ]

  // Handler for selecting a test with error handling
  const handleSelectTest = useCallback((testType: TestType) => {
    try {
      // Force a refresh of the word list
      setRefreshKey((prev) => prev + 1)
      onSelectTest(testType, selectedDifficulty)
    } catch (error) {
      console.error("Error selecting test:", error)
      // Could add additional error handling here
    }
  }, [onSelectTest, selectedDifficulty])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel}></div>
      <Card className="w-full max-w-3xl relative z-[101] shadow-xl border-0 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 dark:border-violet-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 dark:from-violet-400 dark:to-indigo-400 text-transparent bg-clip-text">
            Choose a Test Type
          </CardTitle>
          <CardDescription>Select the type of test you want to take</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center mb-4">
            <Tabs value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as "easy" | "medium" | "hard")}>
              <TabsList className="bg-violet-100 dark:bg-violet-900/50">
                <TabsTrigger
                  value="easy"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
                >
                  Easy
                </TabsTrigger>
                <TabsTrigger
                  value="medium"
                  className="data-[state=active]:bg-violet-600 data-[state=active]:text-white dark:data-[state=active]:bg-violet-700"
                >
                  Medium
                </TabsTrigger>
                <TabsTrigger
                  value="hard"
                  className="data-[state=active]:bg-rose-600 data-[state=active]:text-white dark:data-[state=active]:bg-rose-700"
                >
                  Hard
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testTypes.map((test) => (
              <motion.div key={test.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className={`w-full h-auto p-4 flex flex-col items-center justify-center gap-3 border-2 border-violet-200 dark:border-violet-800 ${
                    test.available 
                      ? "hover:bg-white/50 dark:hover:bg-gray-800/50" 
                      : "opacity-60 cursor-not-allowed"
                  }`}
                  onClick={() => test.available && handleSelectTest(test.id)}
                  disabled={!test.available}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${test.color} flex items-center justify-center text-white`}
                  >
                    {test.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{test.title}</h3>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${
                      selectedDifficulty === "easy"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : selectedDifficulty === "medium"
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                    }`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedDifficulty === "easy" ? "Relaxed pace" : selectedDifficulty === "medium" ? "Standard pace" : "Fast pace"}
                  </Badge>
                  {!test.available && (
                    <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/30"
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
