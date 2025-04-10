"use client"

import React, { useState } from "react"
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
  Star
} from "lucide-react"
import { useTheme } from "next-themes"
import { useDatabase } from "@/hooks/use-db"
import type { TestResult } from "@/lib/db"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'learning' | 'performance' | 'consistency' | 'mastery'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  xpReward: number
  condition: (userProgress: any) => boolean
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { userProgress, words, isLoading } = useDatabase()
  const { theme } = useTheme()

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
    ? Math.round((userProgress.totalScore / (userProgress.totalTests * 10)) * 100) || 0
    : 0
  
  // Calculate last 7 days progress
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentTests = userProgress.testResults
    ? userProgress.testResults.filter((test: TestResult) => new Date(test.date) > sevenDaysAgo)
    : []
  
  const recentWordsLearned = recentTests.reduce((total: number, test: TestResult) => total + test.score, 0)

  // Calculate level progress
  const currentLevel = userProgress.level || 1
  const currentXP = userProgress.experience || 0
  const xpToNextLevel = currentLevel * 100
  const levelProgress = Math.round((currentXP / xpToNextLevel) * 100)

  // Enhanced achievements with categories and tiers
  const achievements: Achievement[] = [
    // Learning Achievements
    {
      id: "first_correct",
      title: "First Steps",
      description: "Answer your first word correctly",
      icon: <Medal className="h-6 w-6 text-yellow-500" />,
      category: 'learning',
      tier: 'bronze',
      xpReward: 50,
      condition: (progress) => progress.correct.length > 0,
    },
    {
      id: "ten_correct",
      title: "Word Warrior",
      description: "Answer 10 words correctly",
      icon: <Award className="h-6 w-6 text-indigo-500" />,
      category: 'learning',
      tier: 'silver',
      xpReward: 100,
      condition: (progress) => progress.correct.length >= 10,
    },
    {
      id: "learned_20",
      title: "Vocabulary Builder",
      description: "Mark 20 words as learned",
      icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
      category: 'learning',
      tier: 'silver',
      xpReward: 100,
      condition: (progress) => progress.learned.length >= 20,
    },
    {
      id: "learned_50",
      title: "Word Master",
      description: "Mark 50 words as learned",
      icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
      category: 'learning',
      tier: 'gold',
      xpReward: 200,
      condition: (progress) => progress.learned.length >= 50,
    },
    {
      id: "learned_100",
      title: "Vocabulary Legend",
      description: "Mark 100 words as learned",
      icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
      category: 'learning',
      tier: 'platinum',
      xpReward: 500,
      condition: (progress) => progress.learned.length >= 100,
    },

    // Performance Achievements
    {
      id: "perfect_score",
      title: "Perfect Score",
      description: "Get a perfect score on any test",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      category: 'performance',
      tier: 'bronze',
      xpReward: 50,
      condition: (progress) => progress.testHistory.some((test: any) => test.score === test.totalPossible),
    },
    {
      id: "high_accuracy",
      title: "Accuracy Expert",
      description: "Maintain 90% accuracy across 10 tests",
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      category: 'performance',
      tier: 'gold',
      xpReward: 200,
      condition: (progress) => {
        const recentTests = progress.testHistory.slice(-10);
        return recentTests.length >= 10 && 
               recentTests.every((test: any) => (test.score / test.totalPossible) >= 0.9);
      },
    },

    // Consistency Achievements
    {
      id: "streak_3",
      title: "Consistent Scholar",
      description: "Maintain a 3-day streak",
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      category: 'consistency',
      tier: 'bronze',
      xpReward: 50,
      condition: (progress) => progress.streakDays >= 3,
    },
    {
      id: "streak_7",
      title: "Dedicated Learner",
      description: "Maintain a 7-day streak",
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      category: 'consistency',
      tier: 'silver',
      xpReward: 100,
      condition: (progress) => progress.streakDays >= 7,
    },
    {
      id: "streak_30",
      title: "Learning Legend",
      description: "Maintain a 30-day streak",
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      category: 'consistency',
      tier: 'platinum',
      xpReward: 500,
      condition: (progress) => progress.streakDays >= 30,
    },

    // Mastery Achievements
    {
      id: "level_5",
      title: "Rising Star",
      description: "Reach level 5",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      category: 'mastery',
      tier: 'bronze',
      xpReward: 50,
      condition: (progress) => progress.level >= 5,
    },
    {
      id: "level_10",
      title: "Master Learner",
      description: "Reach level 10",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      category: 'mastery',
      tier: 'silver',
      xpReward: 100,
      condition: (progress) => progress.level >= 10,
    },
    {
      id: "level_20",
      title: "Grand Master",
      description: "Reach level 20",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      category: 'mastery',
      tier: 'platinum',
      xpReward: 500,
      condition: (progress) => progress.level >= 20,
    },
    {
      id: "all_tests",
      title: "Test Master",
      description: "Complete all test types",
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      category: 'mastery',
      tier: 'gold',
      xpReward: 200,
      condition: (progress) => {
        const testTypes = new Set(progress.testHistory.map((test: any) => test.testType));
        return testTypes.size >= 5; // Assuming 5 different test types
      },
    }
  ];

  // Calculate category-specific statistics
  const learningStats = {
    totalWords,
    learnedWords,
    completionPercentage,
    averageTimePerWord: userProgress.totalTimeSpent / learnedWords || 0,
  };

  const performanceStats = {
    testAccuracy,
    totalTests: userProgress.totalTests || 0,
    averageTestScore: userProgress.totalScore / (userProgress.totalTests || 1),
    bestStreak: userProgress.bestStreak || 0,
  };

  const consistencyStats = {
    currentStreak: userProgress.streakDays || 0,
    totalDaysActive: userProgress.testHistory.length,
    averageDailyTests: userProgress.testHistory.length / 30, // Last 30 days
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Track your learning progress and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="flex gap-1 py-1.5 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-800"
          >
            <Flame className="w-4 h-4" />
            <span>{userProgress.streak || 0} Day Streak</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="flex gap-1 py-1.5 text-purple-500 dark:text-purple-400 border-purple-200 dark:border-purple-800"
          >
            <Zap className="w-4 h-4" />
            <span>Level {currentLevel}</span>
          </Badge>
        </div>
      </div>

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
                  From {userProgress.totalTests || 0} tests
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
                      <Badge variant={test.score / test.totalPossible >= 0.8 ? "success" : 
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
                  <span className="font-medium">{Math.round(userProgress.totalTimeSpent / 60)} min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = userProgress.achievements.includes(achievement.id);
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
    </div>
  )
} 