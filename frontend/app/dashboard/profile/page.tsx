"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, ArrowLeft, Pencil } from "lucide-react";
import {
  authService,
  profileService,
  type ProfileData,
} from "@/lib/api/services";

/* -------------------- PAGE -------------------- */

export default function ProfilePage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // form state
  const [fullName, setFullName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [studyTimePreference, setStudyTimePreference] = useState("");
  const [interests, setInterests] = useState("");
  const [courses, setCourses] = useState("");

  // snapshot for cancel
  const [originalData, setOriginalData] = useState<any>(null);

  /* -------------------- LOAD -------------------- */

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      console.log("[v0] No auth token found, profile loading skipped");
      setInitialLoading(false);
      setEditing(true); // Start in edit mode if no profile exists
      return;
    }

    const load = async () => {
      try {
        // Get current user to know which profile to load
        const me = await authService.me();
        console.log("[v0] Current user:", me);
        const userId = me.user?.id || me.user?.sub || me.id;

        if (!userId) {
          throw new Error("Could not determine current user id");
        }

        const profile = await profileService.getById(userId);
        console.log("[v0] Loaded profile:", profile);

        const normalized = {
          fullName: profile.fullName || "",
          major: profile.major || "",
          year: profile.year || "",
          bio: profile.bio || "",
          learningStyle: profile.learningStyle || "",
          studyTimePreference: profile.studyPreference || "",
          interests: (profile.interests || []).join(", ") || "",
          courses: (profile.courses || []).join(", ") || "",
        };

        setOriginalData(normalized);

        setFullName(normalized.fullName);
        setMajor(normalized.major);
        setYear(normalized.year);
        setBio(normalized.bio);
        setLearningStyle(normalized.learningStyle);
        setStudyTimePreference(normalized.studyTimePreference);
        setInterests(normalized.interests);
        setCourses(normalized.courses);
      } catch (err: any) {
        console.error("[v0] Profile load error:", err);
        if (err.response?.status === 404) {
          setEditing(true);
        } else {
          setError(err.message || "Failed to load profile");
        }
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, []);

  /* -------------------- SAVE -------------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const parsedInterests = interests
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const parsedCourses = courses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const payload: ProfileData = {
      fullName,
      major,
      year,
      bio,
      learningStyle,
      studyPreference: studyTimePreference,
      interests: parsedInterests,
      courses: parsedCourses,
    };

    console.log("[v0] Saving profile with payload:", payload);

    try {
      const result = await profileService.upsert(payload);
      console.log("[v0] Profile saved successfully:", result);
      setSuccess(true);
      setEditing(false);
      setOriginalData({
        fullName,
        major,
        year,
        bio,
        learningStyle,
        studyTimePreference,
        interests,
        courses,
      });
      
      // Redirect to matches page after successful save
      setTimeout(() => {
        console.log("[v0] Redirecting to matches page...");
        window.location.href = "/dashboard/matches";
      }, 1500);
    } catch (err: any) {
      console.error("[v0] Profile save error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!originalData) return;
    setFullName(originalData.fullName);
    setMajor(originalData.major);
    setYear(originalData.year);
    setBio(originalData.bio);
    setLearningStyle(originalData.learningStyle);
    setStudyTimePreference(originalData.studyTimePreference);
    setInterests(originalData.interests);
    setCourses(originalData.courses);
    setEditing(false);
  };

  /* -------------------- UI -------------------- */

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B1538]" />
      </div>
    );
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
                <Input
                  disabled={!editing}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>

              <Field label="Major">
                <Select
                  disabled={!editing}
                  value={major}
                  onValueChange={setMajor}
                >
                  <SelectTrigger className="w-full bg-white border border-input">
                    <SelectValue placeholder="Select major" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-foreground border border-gray-200 shadow-lg z-50 min-w-[12rem]">
                    <SelectItem value="computer-science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Year">
                <Select
                  disabled={!editing}
                  value={year}
                  onValueChange={setYear}
                >
                  <SelectTrigger className="w-full bg-white border border-input">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-foreground border border-gray-200 shadow-lg z-50 min-w-[12rem]">
                    <SelectItem value="Freshman">Freshman</SelectItem>
                    <SelectItem value="Sophomore">Sophomore</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Bio">
                <Textarea
                  disabled={!editing}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </Field>

              <Field label="Learning Style">
                <Select
                  disabled={!editing}
                  value={learningStyle}
                  onValueChange={setLearningStyle}
                >
                  <SelectTrigger className="w-full bg-white border border-input">
                    <SelectValue placeholder="Select learning style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-foreground border border-gray-200 shadow-lg z-50 min-w-[12rem]">
                    <SelectItem value="Visual">Visual</SelectItem>
                    <SelectItem value="Auditory">Auditory</SelectItem>
                    <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                    <SelectItem value="Reading/Writing">
                      Reading/Writing
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Study Preference">
                <Select
                  disabled={!editing}
                  value={studyTimePreference}
                  onValueChange={setStudyTimePreference}
                >
                  <SelectTrigger className="w-full bg-white border border-input">
                    <SelectValue placeholder="Select study preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-foreground border border-gray-200 shadow-lg z-50 min-w-[12rem]">
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Courses (comma-separated)">
                <Input
                  disabled={!editing}
                  value={courses}
                  onChange={(e) => setCourses(e.target.value)}
                  placeholder="e.g. CS101, MATH201, PHYS101"
                />
              </Field>

              <Field label="Interests (comma-separated)">
                <Input
                  disabled={!editing}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Web Development, Machine Learning, Photography"
                />
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
  );
}

/* -------------------- SMALL HELPER -------------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
