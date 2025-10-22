"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Users, MessageSquare, Star, Trophy, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Welcome to Study Buddy!",
      description: "Your platform for collaborative learning",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Study Buddy connects you with like-minded students to enhance your learning experience through collaboration
            and peer support.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#8B1538] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Find Perfect Study Partners</h4>
                <p className="text-sm text-muted-foreground">
                  Our intelligent matching algorithm connects you with students in your courses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#8B1538] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Collaborate in Real-Time</h4>
                <p className="text-sm text-muted-foreground">Chat with your study partners instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#8B1538] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Get Peer Feedback</h4>
                <p className="text-sm text-muted-foreground">Submit work for review and help others improve</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Build Your Profile",
      description: "Help us match you with the right study partners",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            A complete profile helps us find the best study partners for you. Include:
          </p>
          <div className="grid gap-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Your Courses</h4>
              <p className="text-sm text-muted-foreground">
                Add all the courses you're taking to find students in the same classes
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Learning Style</h4>
              <p className="text-sm text-muted-foreground">
                Visual, auditory, or kinesthetic? This helps match you with compatible partners
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Study Preferences</h4>
              <p className="text-sm text-muted-foreground">Share your availability and preferred study times</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Find Study Partners",
      description: "Connect with students who share your goals",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Our matching system considers multiple factors:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#8B1538] text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Common Courses</h4>
                <p className="text-sm text-muted-foreground">Students in your classes get priority</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#8B1538] text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Shared Interests</h4>
                <p className="text-sm text-muted-foreground">Similar academic interests strengthen matches</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#8B1538] text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Learning Compatibility</h4>
                <p className="text-sm text-muted-foreground">Compatible learning styles improve collaboration</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Peer Reviews & Gamification",
      description: "Grow together and earn rewards",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <div className="p-4 border-2 border-[#8B1538] rounded-lg bg-[#8B1538]/5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-[#8B1538]" />
              <h4 className="font-semibold">Peer Review System</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Submit your work for feedback and help others improve theirs. Quality reviews earn you points!
            </p>
          </div>
          <div className="p-4 border-2 border-[#8B1538] rounded-lg bg-[#8B1538]/5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-[#8B1538]" />
              <h4 className="font-semibold">Achievements & Levels</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Earn badges for milestones like making connections, completing reviews, and helping peers. Climb the
              leaderboard!
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#8B1538]">🎯</div>
              <p className="text-xs mt-1">First Match</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#8B1538]">⭐</div>
              <p className="text-xs mt-1">5 Reviews</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#8B1538]">🏆</div>
              <p className="text-xs mt-1">Top Contributor</p>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard/profile")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard/profile")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B1538] rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Getting Started</h1>
            </div>
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full mx-1 transition-colors ${
                  index <= currentStep ? "bg-[#8B1538]" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-[#8B1538] rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base">{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {currentStepData.content}

            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1">
                  Previous
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1 bg-[#8B1538] hover:bg-[#A91D3A]">
                {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
