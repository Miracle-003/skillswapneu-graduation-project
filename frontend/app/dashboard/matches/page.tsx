"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { authService, profileService } from "@/lib/api/services";
import { calculateProfileCompletion } from "@/lib/utils";

export default function MatchesPage() {
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log("[v0] Loading profile for match page");
        const me = await authService.me();
        console.log("[v0] Current user for matches:", me);
        const userId = me.user?.id || me.user?.sub || me.id;

        if (!userId) {
          console.log("[v0] No userId found");
          setCompletion(0);
          return;
        }

        const profile = await profileService.getById(userId);
        console.log("[v0] Profile for completion calculation:", profile);
        const percent = calculateProfileCompletion(profile);
        console.log("[v0] Profile completion percentage:", percent);

        setCompletion(percent);
      } catch (err: any) {
        console.error("[v0] Failed to load profile for matches:", err);
        setError(err.message || "Failed to load profile");
        setCompletion(0);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading matches...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold">Find Your Study Partner</h1>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {completion < 100 && (
          <Alert>
            <AlertDescription>
              Your profile is {completion}% complete.{" "}
              <Link href="/profile" className="underline font-semibold">
                Add more information
              </Link>{" "}
              to get better matches.
            </AlertDescription>
          </Alert>
        )}

        {completion >= 100 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Users className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">
                    You have a complete profile!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Matches will be shown here.
                  </p>
                </div>
                <Button>Find Matches</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
