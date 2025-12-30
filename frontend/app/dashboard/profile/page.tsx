"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { CheckCircle, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

const profileService = {
  getProfile: async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const res = await fetch(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
  },
  updateProfile: async (data: any) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const res = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
  },
};

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [studyTimePreference, setStudyTimePreference] = useState("");
  const [interests, setInterests] = useState("");
  const [courses, setCourses] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        setFullName(profile.fullName || "");
        setMajor(profile.major || "");
        setYear(profile.year || "");
        setBio(profile.bio || "");
        setLearningStyle(profile.learningStyle || "");
        setStudyTimePreference(profile.studyTimePreference || "");
        setInterests(profile.interests || "");
        setCourses(profile.courses || "");
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const profileData = {
      fullName,
      major,
      year,
      bio,
      learningStyle,
      studyTimePreference,
      interests,
      courses,
    };

    try {
      await profileService.updateProfile(profileData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B1538]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className="ml-2">
              Profile updated successfully!
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
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Select
                    value={major}
                    onValueChange={setMajor}
                    disabled={loading}
                  >
                    <SelectTrigger id="major">
                      <SelectValue placeholder="Select your major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">
                        Computer Science
                      </SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="psychology">Psychology</SelectItem>
                      <SelectItem value="economics">Economics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={year}
                    onValueChange={setYear}
                    disabled={loading}
                  >
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freshman">Freshman</SelectItem>
                      <SelectItem value="sophomore">Sophomore</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your academic goals and interests..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courses">Courses</Label>
                <Input
                  id="courses"
                  value={courses}
                  onChange={(e) => setCourses(e.target.value)}
                  placeholder="e.g., CS101, MATH201, PHYS150 (comma-separated)"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Enter your current courses separated by commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Input
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Machine Learning, Web Development, Data Science (comma-separated)"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Enter your academic interests separated by commas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>
                Help us match you with compatible study partners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="learningStyle">Learning Style</Label>
                <Select
                  value={learningStyle}
                  onValueChange={setLearningStyle}
                  disabled={loading}
                >
                  <SelectTrigger id="learningStyle">
                    <SelectValue placeholder="Select your learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="auditory">Auditory</SelectItem>
                    <SelectItem value="reading-writing">
                      Reading/Writing
                    </SelectItem>
                    <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                    <SelectItem value="multimodal">Multimodal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyTimePreference">
                  Study Time Preference
                </Label>
                <Select
                  value={studyTimePreference}
                  onValueChange={setStudyTimePreference}
                  disabled={loading}
                >
                  <SelectTrigger id="studyTimePreference">
                    <SelectValue placeholder="When do you prefer to study?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early-morning">
                      Early Morning (5am - 9am)
                    </SelectItem>
                    <SelectItem value="morning">
                      Morning (9am - 12pm)
                    </SelectItem>
                    <SelectItem value="afternoon">
                      Afternoon (12pm - 5pm)
                    </SelectItem>
                    <SelectItem value="evening">Evening (5pm - 9pm)</SelectItem>
                    <SelectItem value="night">Night (9pm - 1am)</SelectItem>
                    <SelectItem value="late-night">
                      Late Night (1am - 5am)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="bg-[#8B1538] hover:bg-[#A91D3A] min-w-[120px]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
