"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Trophy,
  Flame,
  Brain,
  Zap,
  Heart,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Medal,
  Star,
  Home,
  Target,
  Users,
  History,
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Headphones,
  Pencil,
  RefreshCw,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  PenTool,
  SplitSquareVertical,
  Keyboard,
  Puzzle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useDatabase } from "@/hooks/use-db"
import type { TestResult, WordEntry, TestType } from "@/lib/db"
import Link from "next/link"
import { format, subDays, isToday, isYesterday } from "date-fns"
import { Chart } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { HeatMapGrid } from 'react-grid-heatmap'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from "canvas-confetti"
import { v4 as uuidv4 } from "uuid"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js'
import { DayPicker } from "react-day-picker"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
)

interface UserProgress {
  level: number
  experience: number
  streakDays: number
  totalScore: number
  learned: number[]
  correct: number[]
  achievements: string[]
  testHistory: {
    id: string
    date: string
    testType: string
    score: number
    totalPossible: number
    timeSpent: number
  }[]
  totalTimeSpent?: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'learning' | 'performance' | 'consistency' | 'mastery' | 'social'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  xpReward: number
  condition: (userProgress: UserProgress) => boolean
}

interface DailyGoal {
  wordsToLearn: number
  testsToComplete: number
  currentStreak: number
  progress: {
    wordsLearned: number
    testsCompleted: number
  }
}

interface LeaderboardEntry {
  id: string
  name: string
  level: number
  xp: number
  streak: number
  wordsLearned: number
}

interface WordDifficulty {
  wordId: number
  difficulty: number
  attempts: number
  successRate: number
  lastSeen: Date
}

interface LearningPattern {
  bestTime: string
  averageSessionDuration: number
  preferredTestTypes: string[]
  weakPoints: string[]
  strongPoints: string[]
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  reward: number
  progress: number
  target: number
  deadline: Date
  status: 'active' | 'completed' | 'failed'
}

interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  words: number[]
  recommendedOrder: number[]
  estimatedTime: number
  prerequisites: string[]
}

interface CommunityChallenge {
  id: string
  title: string
  description: string
  creator: {
    id: string
    name: string
    avatar: string
  }
  participants: number
  startDate: Date
  endDate: Date
  reward: number
  status: 'active' | 'upcoming' | 'completed'
  leaderboard: {
    userId: string
    name: string
    avatar: string
    score: number
    rank: number
  }[]
}

interface Badge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'learning' | 'social' | 'achievement' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  target: number
  unlocked: boolean
}

interface LearningMode {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: number
  xpReward: number
  type: 'practice' | 'test' | 'challenge'
}

interface SpacedRepetition {
  wordId: number
  nextReview: Date
  interval: number
  easeFactor: number
  repetitions: number
  lastReview: Date
}

interface LearningAnalytics {
  sessionDuration: number
  wordsPerMinute: number
  accuracy: number
  focusScore: number
  retentionRate: number
}

interface InteractiveExercise {
  id: string
  type: 'fillBlank' | 'multipleChoice' | 'matching' | 'spelling' | 'rapidFire'
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  xpReward: number
  description: string
}

interface FlashcardMode {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: number
  xpReward: number
  type: 'standard' | 'reverse' | 'audio' | 'writing' | 'memory'
}

interface FlashcardStats {
  totalCards: number
  masteredCards: number
  reviewCards: number
  newCards: number
  averageTime: number
  successRate: number
}

interface FlashcardSession {
  id: string
  date: Date
  mode: string
  duration: number
  cardsReviewed: number
  accuracy: number
  streak: number
}

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { userProgress, words, isLoading } = useDatabase()
  const { theme } = useTheme()
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [customGoal, setCustomGoal] = useState({
    wordsPerDay: 10,
    testsPerDay: 3,
    targetAccuracy: 80,
    streakGoal: 7
  })
  const [selectedLearningPath, setSelectedLearningPath] = useState<string | null>(null)
  const [communityChallenges, setCommunityChallenges] = useState<CommunityChallenge[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [selectedLearningMode, setSelectedLearningMode] = useState<string | null>(null)
  const [spacedRepetition, setSpacedRepetition] = useState<SpacedRepetition[]>([])
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics>({
    sessionDuration: 0,
    wordsPerMinute: 0,
    accuracy: 0,
    focusScore: 0,
    retentionRate: 0
  })
  const [flashcardModes, setFlashcardModes] = useState<FlashcardMode[]>([
    {
      id: 'standard',
      title: 'Standard Mode',
      description: 'Learn words with traditional flashcards',
      icon: <BookOpen className="h-6 w-6" />,
      difficulty: 'easy',
      timeEstimate: 10,
      xpReward: 10,
      type: 'standard'
    },
    {
      id: 'reverse',
      title: 'Reverse Mode',
      description: 'Test your understanding by seeing the meaning first',
      icon: <RotateCcw className="h-6 w-6" />,
      difficulty: 'medium',
      timeEstimate: 15,
      xpReward: 15,
      type: 'reverse'
    },
    {
      id: 'audio',
      title: 'Audio Mode',
      description: 'Learn through listening and pronunciation',
      icon: <Headphones className="h-6 w-6" />,
      difficulty: 'medium',
      timeEstimate: 12,
      xpReward: 12,
      type: 'audio'
    },
    {
      id: 'writing',
      title: 'Writing Mode',
      description: 'Practice writing and spelling',
      icon: <Pencil className="h-6 w-6" />,
      difficulty: 'hard',
      timeEstimate: 20,
      xpReward: 20,
      type: 'writing'
    },
    {
      id: 'memory',
      title: 'Memory Mode',
      description: 'Test your memory with timed challenges',
      icon: <Brain className="h-6 w-6" />,
      difficulty: 'hard',
      timeEstimate: 15,
      xpReward: 18,
      type: 'memory'
    }
  ])

  const [flashcardStats, setFlashcardStats] = useState<FlashcardStats>({
    totalCards: 0,
    masteredCards: 0,
    reviewCards: 0,
    newCards: 0,
    averageTime: 0,
    successRate: 0
  })

  const [recentSessions, setRecentSessions] = useState<FlashcardSession[]>([])

  if (isLoading || !userProgress) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate statistics
  const totalWords = words.length
  const learnedWords = userProgress.learned.length
  const completionPercentage = Math.round((learnedWords / totalWords) * 100) || 0
  const testAccuracy = userProgress.totalScore > 0 
    ? Math.round((userProgress.totalScore / (userProgress.testHistory.length * 10)) * 100) || 0
    : 0
  
  // Calculate last 7 days progress
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentTests = userProgress.testHistory
    ? userProgress.testHistory.filter((test: TestResult) => new Date(test.date) > sevenDaysAgo)
    : []
  
  const recentWordsLearned = recentTests.reduce((total: number, test: TestResult) => total + test.score, 0)

  // Calculate level progress
  const currentLevel = userProgress.level || 1
  const currentXP = userProgress.experience || 0
  const xpToNextLevel = currentLevel * 100
  const levelProgress = Math.round((currentXP / xpToNextLevel) * 100)

  // Mock leaderboard data (replace with real data later)
  const leaderboard: LeaderboardEntry[] = [
    { id: "1", name: "You", level: currentLevel, xp: currentXP, streak: userProgress.streakDays, wordsLearned: learnedWords },
    { id: "2", name: "John", level: 12, xp: 1150, streak: 15, wordsLearned: 85 },
    { id: "3", name: "Sarah", level: 10, xp: 950, streak: 8, wordsLearned: 75 },
    { id: "4", name: "Mike", level: 9, xp: 850, streak: 5, wordsLearned: 65 },
    { id: "5", name: "Emma", level: 8, xp: 750, streak: 3, wordsLearned: 55 },
  ]

  // Calculate daily goals
  const dailyGoals: DailyGoal = {
    wordsToLearn: 10,
    testsToComplete: 3,
    currentStreak: userProgress.streakDays,
    progress: {
      wordsLearned: recentWordsLearned,
      testsCompleted: recentTests.length,
    }
  }

  // Calculate word mastery levels
  const masteryLevels = {
    mastered: userProgress.learned.filter((wordId: number) => {
      const wordTests = userProgress.testHistory.filter((test: any) => 
        test.words.includes(wordId)
      )
      return wordTests.length >= 3 && 
             wordTests.every((test: any) => test.score === test.totalPossible)
    }).length,
    learning: userProgress.learned.length - userProgress.learned.filter((wordId: number) => {
      const wordTests = userProgress.testHistory.filter((test: any) => 
        test.words.includes(wordId)
      )
      return wordTests.length >= 3 && 
             wordTests.every((test: any) => test.score === test.totalPossible)
    }).length,
    new: totalWords - userProgress.learned.length
  }

  // Calculate word difficulty
  const wordDifficulties: WordDifficulty[] = userProgress.learned.map((wordId: number) => {
    const wordTests = userProgress.testHistory.filter((test: any) => 
      test.words.includes(wordId)
    )
    const attempts = wordTests.length
    const successRate = attempts > 0 
      ? wordTests.filter((test: any) => test.score === test.totalPossible).length / attempts
      : 0
    const lastSeen = wordTests.length > 0 
      ? new Date(Math.max(...wordTests.map((test: any) => new Date(test.date).getTime())))
      : new Date()
    
    return {
      wordId,
      difficulty: Math.round((1 - successRate) * 100),
      attempts,
      successRate,
      lastSeen
    }
  })

  // Analyze learning patterns
  const learningPatterns: LearningPattern = {
    bestTime: calculateBestTime(),
    averageSessionDuration: calculateAverageSessionDuration(),
    preferredTestTypes: calculatePreferredTestTypes(),
    weakPoints: identifyWeakPoints(),
    strongPoints: identifyStrongPoints()
  }

  // Generate challenges
  const challenges: Challenge[] = [
    {
      id: 'daily-1',
      title: 'Daily Mastery',
      description: 'Achieve 90% accuracy in 3 tests',
      type: 'daily',
      reward: 50,
      progress: calculateDailyProgress(),
      target: 3,
      deadline: new Date(new Date().setHours(23, 59, 59)),
      status: 'active'
    },
    {
      id: 'weekly-1',
      title: 'Consistency Champion',
      description: 'Maintain a 7-day streak',
      type: 'weekly',
      reward: 200,
      progress: userProgress.streakDays,
      target: 7,
      deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
      status: userProgress.streakDays >= 7 ? 'completed' : 'active'
    },
    {
      id: 'monthly-1',
      title: 'Vocabulary Builder',
      description: 'Learn 100 new words',
      type: 'monthly',
      reward: 500,
      progress: learnedWords,
      target: 100,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: learnedWords >= 100 ? 'completed' : 'active'
    }
  ]

  // Calculate category-specific statistics
  const learningStats = {
    totalWords,
    learnedWords,
    completionPercentage,
    averageTimePerWord: userProgress.testHistory.reduce((total: number, test: TestResult) => total + test.timeSpent, 0) / learnedWords || 0,
  };

  const performanceStats = {
    testAccuracy,
    totalTests: userProgress.testHistory.length,
    averageTestScore: userProgress.totalScore / (userProgress.testHistory.length || 1),
    bestStreak: userProgress.streakDays || 0,
  };

  const consistencyStats = {
    currentStreak: userProgress.streakDays || 0,
    totalDaysActive: userProgress.testHistory.length,
    averageDailyTests: userProgress.testHistory.length / 30, // Last 30 days
  };

  // Chart data for progress
  const progressChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Words Learned',
        data: [5, 8, 12, 6, 9, 11, 7],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Test Accuracy',
        data: [75, 82, 78, 85, 90, 88, 92],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  }

  // Chart data for word difficulty
  const difficultyChartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{
      data: [
        wordDifficulties.filter(w => w.difficulty < 30).length,
        wordDifficulties.filter(w => w.difficulty >= 30 && w.difficulty < 70).length,
        wordDifficulties.filter(w => w.difficulty >= 70).length
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
    }]
  }

  // Generate learning paths
  const learningPaths: LearningPath[] = [
    {
      id: 'beginner-1',
      title: 'Essential Vocabulary',
      description: 'Master the most common words and phrases',
      difficulty: 'beginner',
      progress: 45,
      words: [1, 2, 3, 4, 5],
      recommendedOrder: [1, 2, 3, 4, 5],
      estimatedTime: 30,
      prerequisites: []
    },
    {
      id: 'intermediate-1',
      title: 'Business Communication',
      description: 'Learn professional vocabulary and expressions',
      difficulty: 'intermediate',
      progress: 20,
      words: [6, 7, 8, 9, 10],
      recommendedOrder: [6, 7, 8, 9, 10],
      estimatedTime: 45,
      prerequisites: ['beginner-1']
    },
    {
      id: 'advanced-1',
      title: 'Academic Writing',
      description: 'Master complex academic vocabulary',
      difficulty: 'advanced',
      progress: 0,
      words: [11, 12, 13, 14, 15],
      recommendedOrder: [11, 12, 13, 14, 15],
      estimatedTime: 60,
      prerequisites: ['intermediate-1']
    }
  ]

  // Generate heatmap data
  const heatmapData = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
  )

  // Generate badges
  const achievements: Achievement[] = [
    {
      id: "streak_7",
      title: "7-Day Streak",
      description: "Maintain a learning streak for 7 days",
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      category: 'consistency',
      tier: 'bronze',
      xpReward: 50,
      condition: (progress: UserProgress) => progress.streakDays >= 7,
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Participate in 5 community challenges',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      category: 'social',
      tier: 'silver',
      xpReward: 75,
      condition: () => false, // Placeholder condition
    },
    {
      id: 'word-wizard',
      title: 'Word Wizard',
      description: 'Learn 1000 words',
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      category: 'learning',
      tier: 'gold',
      xpReward: 100,
      condition: (progress: UserProgress) => (progress.learned?.length || 0) >= 1000,
    }
  ]

  // Learning modes
  const learningModes: LearningMode[] = [
    {
      id: 'practice',
      title: 'Practice Mode',
      description: 'Learn at your own pace with no time pressure',
      icon: <BookOpen className="h-6 w-6" />,
      difficulty: 'easy',
      timeEstimate: 15,
      xpReward: 10,
      type: 'practice'
    },
    {
      id: 'timed',
      title: 'Timed Challenge',
      description: 'Test your speed and accuracy under time pressure',
      icon: <Clock className="h-6 w-6" />,
      difficulty: 'medium',
      timeEstimate: 10,
      xpReward: 20,
      type: 'challenge'
    },
    {
      id: 'mastery',
      title: 'Mastery Mode',
      description: 'Focus on difficult words until you master them',
      icon: <Target className="h-6 w-6" />,
      difficulty: 'hard',
      timeEstimate: 20,
      xpReward: 30,
      type: 'practice'
    }
  ]

  // Interactive exercises
  const exercises: InteractiveExercise[] = [
    {
      id: 'fill-blank',
      type: 'fillBlank',
      difficulty: 'medium',
      timeLimit: 30,
      xpReward: 15,
      description: 'Fill in the missing word in a sentence'
    },
    {
      id: 'multiple-choice',
      type: 'multipleChoice',
      difficulty: 'easy',
      timeLimit: 20,
      xpReward: 10,
      description: 'Choose the correct meaning from options'
    },
    {
      id: 'matching',
      type: 'matching',
      difficulty: 'medium',
      timeLimit: 45,
      xpReward: 20,
      description: 'Match words with their meanings'
    },
    {
      id: 'spelling',
      type: 'spelling',
      difficulty: 'hard',
      timeLimit: 15,
      xpReward: 25,
      description: 'Spell the word correctly'
    },
    {
      id: 'rapid-fire',
      type: 'rapidFire',
      difficulty: 'hard',
      timeLimit: 60,
      xpReward: 30,
      description: 'Answer as many questions as possible in 60 seconds'
    }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleDateSelect = (event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault()
    // Handle date selection
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Flashcard Game</span>
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex gap-1 py-1.5 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-800">
              <Flame className="w-4 h-4" />
              <span>{userProgress.streakDays || 0} Day Streak</span>
            </Badge>
            <Badge variant="outline" className="flex gap-1 py-1.5 text-purple-500 dark:text-purple-400 border-purple-200 dark:border-purple-800">
              <Zap className="w-4 h-4" />
              <span>Level {userProgress.level || 1}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => handleNavigation('/')}
          >
            <Brain className="h-6 w-6" />
            <span>Start Learning</span>
            <span className="text-sm text-muted-foreground">Practice with flashcards</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => handleNavigation('/test')}
          >
            <Zap className="h-6 w-6" />
            <span>Take a Test</span>
            <span className="text-sm text-muted-foreground">Test your knowledge</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => handleNavigation('/words')}
          >
            <BookOpen className="h-6 w-6" />
            <span>Word List</span>
            <span className="text-sm text-muted-foreground">View all words</span>
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              {/* @ts-ignore - Ignore type check for Calendar component */}
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={showAdvancedStats}
            onCheckedChange={setShowAdvancedStats}
          />
          <span className="text-sm">Advanced Stats</span>
        </div>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={progressChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Word Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={difficultyChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Learning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Best Learning Time</h3>
              <p className="text-muted-foreground">{learningPatterns.bestTime}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Average Session Duration</h3>
              <p className="text-muted-foreground">{Math.round(learningPatterns.averageSessionDuration / 60)} minutes</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Strong Points</h3>
              <div className="flex gap-2">
                {learningPatterns.strongPoints.map((point, index) => (
                  <Badge key={index} variant="secondary">{point}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Areas to Improve</h3>
              <div className="flex gap-2">
                {learningPatterns.weakPoints.map((point, index) => (
                  <Badge key={index} variant="destructive">{point}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Words per Day</span>
                <span>{customGoal.wordsPerDay}</span>
              </div>
              <Slider
                value={[customGoal.wordsPerDay]}
                onValueChange={([value]) => setCustomGoal(prev => ({ ...prev, wordsPerDay: value }))}
                min={5}
                max={50}
                step={5}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Tests per Day</span>
                <span>{customGoal.testsPerDay}</span>
              </div>
              <Slider
                value={[customGoal.testsPerDay]}
                onValueChange={([value]) => setCustomGoal(prev => ({ ...prev, testsPerDay: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Target Accuracy</span>
                <span>{customGoal.targetAccuracy}%</span>
              </div>
              <Slider
                value={[customGoal.targetAccuracy]}
                onValueChange={([value]) => setCustomGoal(prev => ({ ...prev, targetAccuracy: value }))}
                min={50}
                max={100}
                step={5}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Streak Goal</span>
                <span>{customGoal.streakGoal} days</span>
              </div>
              <Slider
                value={[customGoal.streakGoal]}
                onValueChange={([value]) => setCustomGoal(prev => ({ ...prev, streakGoal: value }))}
                min={3}
                max={30}
                step={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{challenge.type}</Badge>
                    <Badge variant="secondary">+{challenge.reward} XP</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {challenge.progress}/{challenge.target}
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.target) * 100} 
                    className="w-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {format(challenge.deadline, 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Learning Heatmap</h3>
              <div className="p-4 bg-muted rounded-lg">
                <HeatMapGrid
                  data={heatmapData}
                  xLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                  yLabels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
                  cellStyle={(_x, _y, ratio) => ({
                    background: `rgb(12, 160, 44, ${ratio})`,
                    fontSize: '11px',
                    color: `rgb(0, 0, 0, ${ratio / 2 + 0.4})`,
                  })}
                  cellHeight="30px"
                  onClick={(x, y) => alert(`Clicked (${x}, ${y})`)}
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Learning Paths</h3>
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div 
                    key={path.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLearningPath(path.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{path.title}</h4>
                        <p className="text-sm text-muted-foreground">{path.description}</p>
                      </div>
                      <Badge variant="outline">{path.difficulty}</Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Community Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communityChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={challenge.creator.avatar} />
                    <AvatarFallback>{challenge.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <Badge variant="outline">{challenge.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{challenge.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm">+{challenge.reward} XP</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium mb-2">Leaderboard</h5>
                      <ScrollArea className="h-[100px]">
                        {challenge.leaderboard.map((entry) => (
                          <div key={entry.userId} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={entry.avatar} />
                                <AvatarFallback>{entry.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{entry.name}</span>
                            </div>
                            <span className="text-sm font-medium">{entry.score} pts</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = achievement.condition(userProgress);
              return (
                <Card 
                  key={achievement.id} 
                  className={`overflow-hidden transition-all duration-300 ${
                    isUnlocked ? 'ring-2 ring-offset-2' : 'opacity-75'
                  } ${
                    achievement.tier === 'bronze' ? 'ring-amber-500' :
                    achievement.tier === 'silver' ? 'ring-gray-400' :
                    achievement.tier === 'gold' ? 'ring-yellow-500' :
                    'ring-purple-500'
                  }`}
                >
                  <div className={`p-4 flex justify-center ${
                    achievement.tier === 'bronze' ? 'bg-amber-50' :
                    achievement.tier === 'silver' ? 'bg-gray-50' :
                    achievement.tier === 'gold' ? 'bg-yellow-50' :
                    'bg-purple-50'
                  }`}>
                    <div className={`rounded-full p-3 ${
                      achievement.tier === 'bronze' ? 'bg-amber-100' :
                      achievement.tier === 'silver' ? 'bg-gray-100' :
                      achievement.tier === 'gold' ? 'bg-yellow-100' :
                      'bg-purple-100'
                    }`}>
                      {achievement.icon}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center">{achievement.title}</CardTitle>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {achievement.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {achievement.tier}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {isUnlocked ? (
                      <p className="text-green-600 dark:text-green-400 text-sm">Unlocked! +{achievement.xpReward} XP</p>
                    ) : (
                      <p className="text-gray-500 text-sm">Locked</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learning Modes */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningModes.map((mode) => (
              <Button
                key={mode.id}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-2 p-4"
                onClick={() => handleNavigation(`/learn/${mode.id}`)}
              >
                <div className={`p-2 rounded-full ${
                  mode.difficulty === 'easy' ? 'bg-green-100' :
                  mode.difficulty === 'medium' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  {mode.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-medium">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{mode.timeEstimate} min</span>
                  <div className="h-4 w-px bg-border" />
                  <Zap className="h-4 w-4" />
                  <span>+{mode.xpReward} XP</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Exercises */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => (
              <div 
                key={exercise.id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleNavigation(`/exercise/${exercise.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{exercise.type.replace(/([A-Z])/g, ' $1')}</h3>
                  <Badge variant="outline">{exercise.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{exercise.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{exercise.timeLimit}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    <span>+{exercise.xpReward} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Session Duration</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.floor(learningAnalytics.sessionDuration / 60)} min
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Words/Minute</span>
              </div>
              <div className="text-2xl font-bold">
                {learningAnalytics.wordsPerMinute}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <div className="text-2xl font-bold">
                {learningAnalytics.accuracy}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">Focus Score</span>
              </div>
              <div className="text-2xl font-bold">
                {learningAnalytics.focusScore}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Retention Rate</span>
              </div>
              <div className="text-2xl font-bold">
                {learningAnalytics.retentionRate}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spaced Repetition */}
      <Card>
        <CardHeader>
          <CardTitle>Spaced Repetition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spacedRepetition.map((item) => (
              <div key={item.wordId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">
                    {words.find(w => w.id === item.wordId)?.word}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Next review: {format(item.nextReview, 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Interval</div>
                    <div className="text-sm text-muted-foreground">{item.interval} days</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Ease Factor</div>
                    <div className="text-sm text-muted-foreground">{item.easeFactor.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Repetitions</div>
                    <div className="text-sm text-muted-foreground">{item.repetitions}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Modes */}
      <Card>
        <CardHeader>
          <CardTitle>Flashcard Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardModes.map((mode) => (
              <Button
                key={mode.id}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-2 p-4"
                onClick={() => handleNavigation(`/flashcards/${mode.id}`)}
              >
                <div className={`p-2 rounded-full ${
                  mode.difficulty === 'easy' ? 'bg-green-100' :
                  mode.difficulty === 'medium' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  {mode.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-medium">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{mode.timeEstimate} min</span>
                  <div className="h-4 w-px bg-border" />
                  <Zap className="h-4 w-4" />
                  <span>+{mode.xpReward} XP</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Flashcard Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Total Cards</span>
              </div>
              <div className="text-2xl font-bold">
                {flashcardStats.totalCards}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Mastered Cards</span>
              </div>
              <div className="text-2xl font-bold">
                {flashcardStats.masteredCards}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Average Time</span>
              </div>
              <div className="text-2xl font-bold">
                {flashcardStats.averageTime}s
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold">
                {flashcardStats.successRate}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Review Cards</span>
              </div>
              <div className="text-2xl font-bold">
                {flashcardStats.reviewCards}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">New Cards</span>
              </div>
              <div className="text-2xl font-bold">
                {flashcardStats.newCards}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Flashcard Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">
                    {flashcardModes.find(m => m.id === session.mode)?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(session.date, 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Duration</div>
                    <div className="text-sm text-muted-foreground">{session.duration} min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Cards</div>
                    <div className="text-sm text-muted-foreground">{session.cardsReviewed}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Accuracy</div>
                    <div className="text-sm text-muted-foreground">{session.accuracy}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Streak</div>
                    <div className="text-sm text-muted-foreground">{session.streak}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Learned Words</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learnedWords} / {totalWords}</div>
                <Progress value={completionPercentage} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completionPercentage}% Complete
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Test Accuracy</CardTitle>
                <Brain className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testAccuracy}%</div>
                <Progress value={testAccuracy} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  From {userProgress.testHistory.length} tests
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentWordsLearned}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Words learned this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
                <Award className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentXP} / {xpToNextLevel} XP</div>
                <Progress value={levelProgress} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {levelProgress}% to Level {currentLevel + 1}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTests.length > 0 ? (
                <div className="space-y-4">
                  {recentTests.slice(0, 5).map((test, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="bg-muted rounded-full p-2">
                        {test.testType === 'multipleChoice' && <Brain className="h-4 w-4" />}
                        {test.testType === 'fillBlank' && <Zap className="h-4 w-4" />}
                        {test.testType === 'matching' && <Heart className="h-4 w-4" />}
                        {test.testType === 'spelling' && <BookOpen className="h-4 w-4" />}
                        {test.testType === 'rapidFire' && <Flame className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {test.testType.replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())} Test
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(test.date).toLocaleDateString()} · Score: {test.score}/{test.totalPossible}
                        </p>
                      </div>
                      <Badge variant={test.score / test.totalPossible >= 0.8 ? "secondary" : 
                              test.score / test.totalPossible >= 0.5 ? "default" : "destructive"}>
                        {Math.round((test.score / test.totalPossible) * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent activity to display</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Words:</span>
                  <span className="font-medium">{learningStats.totalWords}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Words Learned:</span>
                  <span className="font-medium">{learningStats.learnedWords}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion:</span>
                  <span className="font-medium">{learningStats.completionPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Time/Word:</span>
                  <span className="font-medium">{Math.round(learningStats.averageTimePerWord)}s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tests Taken:</span>
                  <span className="font-medium">{performanceStats.totalTests}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Score:</span>
                  <span className="font-medium">{Math.round(performanceStats.averageTestScore)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Best Streak:</span>
                  <span className="font-medium">{performanceStats.bestStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accuracy:</span>
                  <span className="font-medium">{performanceStats.testAccuracy}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Consistency Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Streak:</span>
                  <span className="font-medium">{consistencyStats.currentStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Days Active:</span>
                  <span className="font-medium">{consistencyStats.totalDaysActive}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Daily Tests:</span>
                  <span className="font-medium">{consistencyStats.averageDailyTests.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Time Spent:</span>
                  <span className="font-medium">
                    {Math.round(
                      (userProgress.testHistory.reduce((total, test) => total + test.timeSpent, 0)) / 60
                    )} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = achievement.condition(userProgress);
              return (
                <Card 
                  key={achievement.id} 
                  className={`overflow-hidden transition-all duration-300 ${
                    isUnlocked ? 'ring-2 ring-offset-2' : 'opacity-75'
                  } ${
                    achievement.tier === 'bronze' ? 'ring-amber-500' :
                    achievement.tier === 'silver' ? 'ring-gray-400' :
                    achievement.tier === 'gold' ? 'ring-yellow-500' :
                    'ring-purple-500'
                  }`}
                >
                  <div className={`p-4 flex justify-center ${
                    achievement.tier === 'bronze' ? 'bg-amber-50' :
                    achievement.tier === 'silver' ? 'bg-gray-50' :
                    achievement.tier === 'gold' ? 'bg-yellow-50' :
                    'bg-purple-50'
                  }`}>
                    <div className={`rounded-full p-3 ${
                      achievement.tier === 'bronze' ? 'bg-amber-100' :
                      achievement.tier === 'silver' ? 'bg-gray-100' :
                      achievement.tier === 'gold' ? 'bg-yellow-100' :
                      'bg-purple-100'
                    }`}>
                      {achievement.icon}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center">{achievement.title}</CardTitle>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {achievement.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {achievement.tier}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {isUnlocked ? (
                      <p className="text-green-600 dark:text-green-400 text-sm">Unlocked! +{achievement.xpReward} XP</p>
                    ) : (
                      <p className="text-gray-500 text-sm">Locked</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Words Learned</span>
                      <span className="text-sm font-medium">{learningStats.learnedWords}/{learningStats.totalWords}</span>
                    </div>
                    <Progress value={learningStats.completionPercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Level Progress</span>
                      <span className="text-sm font-medium">{currentXP}/{xpToNextLevel} XP</span>
                    </div>
                    <Progress value={levelProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Test Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Test Accuracy</span>
                      <span className="text-sm font-medium">{performanceStats.testAccuracy}%</span>
                    </div>
                    <Progress value={performanceStats.testAccuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Streak Progress</span>
                      <span className="text-sm font-medium">{consistencyStats.currentStreak} days</span>
                    </div>
                    <Progress 
                      value={Math.min((consistencyStats.currentStreak / 30) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

// Helper functions
function calculateBestTime(): string {
  // Implementation for finding the best learning time
  return "Morning (9:00 AM - 11:00 AM)"
}

function calculateAverageSessionDuration(): number {
  // Implementation for calculating average session duration
  return 1800 // in seconds
}

function calculatePreferredTestTypes(): string[] {
  // Implementation for finding preferred test types
  return ['multipleChoice', 'fillBlank']
}

function identifyWeakPoints(): string[] {
  // Implementation for identifying weak points
  return ['Spelling', 'Grammar']
}

function identifyStrongPoints(): string[] {
  // Implementation for identifying strong points
  return ['Vocabulary', 'Reading']
}

function calculateDailyProgress(): number {
  // Implementation for calculating daily progress
  return 2
} 