"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRequireAuth } from "@/lib/api/hooks/useRequireAuth"
import { profileService } from "@/lib/api/services/profile.service"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

const MAJORS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Psychology",
  "Economics",
  "Other",
]

const LEARNING_STYLES = ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"]

const STUDY_PREFERENCES = ["Morning", "Afternoon", "Evening", "Night", "Flexible"]

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    major: "",
    year: "",
    bio: "",
    learning_style: "",
    study_preference: "",
    courses: [] as string[],
    interests: [] as string[],
  })
  const [newCourse, setNewCourse] = useState("")
  const [newInterest, setNewInterest] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  const router = useRouter()
  const { user } = useRequireAuth()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      if (!user) return
      setUserId(user.id)
      const data = await profileService.getById(user.id)
      if (data) {
        setProfile({
          full_name: data.fullName || "",
          major: data.major || "",
          year: data.year || "",
          bio: data.bio || "",
          learning_style: data.learningStyle || "",
          study_preference: data.studyPreference || "",
          courses: [],
          interests: data.interests || [],
        })
      }
    } catch (err: any) {
      console.error("[v0] Error loading profile:", err)
    }
  }

  const handleSave = async () => {
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      // Prefer previously loaded user id to avoid transient null from getUser()
      const uid = userId || user?.id
      if (!uid) throw new Error("Not authenticated")

      await profileService.upsert({
        userId: uid,
        fullName: profile.full_name,
        major: profile.major,
        year: profile.year,
        bio: profile.bio,
        learningStyle: profile.learning_style,
        studyPreference: profile.study_preference,
        interests: profile.interests,
      } as any)

      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  const addCourse = () => {
    if (newCourse.trim() && !profile.courses.includes(newCourse.trim())) {
      setProfile({ ...profile, courses: [...profile.courses, newCourse.trim()] })
      setNewCourse("")
    }
  }

  const removeCourse = (course: string) => {
    setProfile({ ...profile, courses: profile.courses.filter((c) => c !== course) })
  }

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({ ...profile, interests: [...profile.interests, newInterest.trim()] })
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setProfile({ ...profile, interests: profile.interests.filter((i) => i !== interest) })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            prefetch={false}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">Complete your profile to get better study partner matches</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
            <AlertDescription>Profile saved successfully! Redirecting...</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Select value={profile.major} onValueChange={(value) => setProfile({ ...profile, major: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your major" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJORS.map((major) => (
                        <SelectItem key={major} value={major}>
                          {major}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={profile.year} onValueChange={(value) => setProfile({ ...profile, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about your academic goals and interests..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Help us match you with compatible study partners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="learning_style">Learning Style</Label>
                <Select
                  value={profile.learning_style}
                  onValueChange={(value) => setProfile({ ...profile, learning_style: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEARNING_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="study_preference">Study Time Preference</Label>
                <Select
                  value={profile.study_preference}
                  onValueChange={(value) => setProfile({ ...profile, study_preference: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When do you prefer to study?" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_PREFERENCES.map((pref) => (
                      <SelectItem key={pref} value={pref}>
                        {pref}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Add the courses you're currently taking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g., CS 101, Calculus II"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCourse())}
                />
                <Button onClick={addCourse} type="button" className="bg-[#8B1538] hover:bg-[#A91D3A]">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.courses.map((course) => (
                  <Badge key={course} variant="secondary" className="text-sm">
                    {course}
                    <button onClick={() => removeCourse(course)} className="ml-2 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
              <CardDescription>Share your academic and personal interests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="e.g., Machine Learning, Web Development"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                />
                <Button onClick={addInterest} type="button" className="bg-[#8B1538] hover:bg-[#A91D3A]">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-sm">
                    {interest}
                    <button onClick={() => removeInterest(interest)} className="ml-2 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={loading} className="flex-1 bg-[#8B1538] hover:bg-[#A91D3A]">
              {loading ? "Saving..." : "Save Profile"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
