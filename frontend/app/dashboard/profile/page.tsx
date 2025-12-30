"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, ArrowLeft, Pencil } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

/* -------------------- API -------------------- */

const profileService = {
  getProfile: async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("Not authenticated")

    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Failed to load profile")
    return res.json()
  },

  updateProfile: async (data: any) => {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("Not authenticated")

    const res = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) throw new Error("Failed to update profile")
    return res.json()
  },
}

/* -------------------- PAGE -------------------- */

export default function ProfilePage() {
  const [initialLoading, setInitialLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // form state
  const [fullName, setFullName] = useState("")
  const [major, setMajor] = useState("")
  const [year, setYear] = useState("")
  const [bio, setBio] = useState("")
  const [learningStyle, setLearningStyle] = useState("")
  const [studyTimePreference, setStudyTimePreference] = useState("")
  const [interests, setInterests] = useState("")
  const [courses, setCourses] = useState("")

  // snapshot for cancel
  const [originalData, setOriginalData] = useState<any>(null)

  /* -------------------- LOAD -------------------- */

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setInitialLoading(false)
      return
    }

    const load = async () => {
      try {
        const profile = await profileService.getProfile()

        const normalized = {
          fullName: profile.full_name || "",
          major: profile.major || "",
          year: profile.year || "",
          bio: profile.bio || "",
          learningStyle: profile.learning_style || "",
          studyTimePreference: profile.study_preference || "",
          interests: (profile.interests || []).join(", "),
          courses: (profile.courses || []).join(", "),
        }

        setOriginalData(normalized)

        setFullName(normalized.fullName)
        setMajor(normalized.major)
        setYear(normalized.year)
        setBio(normalized.bio)
        setLearningStyle(normalized.learningStyle)
        setStudyTimePreference(normalized.studyTimePreference)
        setInterests(normalized.interests)
        setCourses(normalized.courses)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setInitialLoading(false)
      }
    }

    load()
  }, [])

  /* -------------------- SAVE -------------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    const payload = {
      full_name: fullName,
      major,
      year,
      bio,
      learning_style: learningStyle,
      study_preference: studyTimePreference,
      interests: interests.split(",").map(i => i.trim()).filter(Boolean),
      courses: courses.split(",").map(c => c.trim()).filter(Boolean),
    }

    try {
      await profileService.updateProfile(payload)
      setSuccess(true)
      setEditing(false)
      setOriginalData({ ...payload, interests, courses })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    if (!originalData) return
    setFullName(originalData.fullName)
    setMajor(originalData.major)
    setYear(originalData.year)
    setBio(originalData.bio)
    setLearningStyle(originalData.learningStyle)
    setStudyTimePreference(originalData.studyTimePreference)
    setInterests(originalData.interests)
    setCourses(originalData.courses)
    setEditing(false)
  }

  /* -------------------- UI -------------------- */

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B1538]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">
            View and manage your academic profile
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-900">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className="ml-2">
              Profile updated successfully
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                {editing ? "Edit your details below" : "Profile overview"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Field label="Full Name">
                <Input disabled={!editing} value={fullName} onChange={e => setFullName(e.target.value)} />
              </Field>

              <Field label="Major">
                <Select disabled={!editing} value={major} onValueChange={setMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select major" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50 border shadow-lg">
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Bio">
                <Textarea disabled={!editing} value={bio} onChange={e => setBio(e.target.value)} />
              </Field>

              <Field label="Courses">
                <Input disabled={!editing} value={courses} onChange={e => setCourses(e.target.value)} />
              </Field>

              <Field label="Interests">
                <Input disabled={!editing} value={interests} onChange={e => setInterests(e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          {editing && (
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

/* -------------------- SMALL HELPER -------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
