"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Heart, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { authService, profileService, connectionService } from "@/lib/api/services";
import { matchService } from "@/lib/api/services/match.service";
import { calculateProfileCompletion } from "@/lib/utils";

export default function MatchesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(0);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [connectingWith, setConnectingWith] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading profile and matches");
        const me = await authService.me();
        console.log("[v0] Current user for matches:", me);
        const currentUserId = me.user?.id || me.user?.sub || me.id;

        if (!currentUserId) {
          console.log("[v0] No userId found");
          setCompletion(0);
          return;
        }

        setUserId(currentUserId);

        const profile = await profileService.getById(currentUserId);
        console.log("[v0] Profile for completion calculation:", profile);
        const percent = calculateProfileCompletion(profile);
        console.log("[v0] Profile completion percentage:", percent);

        setCompletion(percent);

        // Fetch matches if profile is complete
        if (percent >= 100) {
          console.log("[v0] Fetching matches for user:", currentUserId);
          const matchesData = await matchService.getUserMatches(currentUserId, "suggestion");
          console.log("[v0] Matches data:", matchesData);
          
          // Fetch full profiles for each match
          if (matchesData && matchesData.length > 0) {
            const matchesWithProfiles = await Promise.all(
              matchesData.map(async (match: any) => {
                const matchedUserId = match.userId1 === currentUserId ? match.userId2 : match.userId1;
                const matchedProfile = await profileService.getById(matchedUserId);
                return {
                  ...match,
                  profile: matchedProfile
                };
              })
            );
            setMatches(matchesWithProfiles);
            console.log("[v0] Matches with profiles:", matchesWithProfiles);
          } else {
            // Use dummy data for presentation (with valid UUID format)
            console.log("[v0] No matches from API, using dummy data");
            setMatches([
              {
                id: "00000000-0000-0000-0000-000000000021",
                userId1: currentUserId,
                userId2: "00000000-0000-0000-0000-000000000011",
                compatibilityScore: 92,
                status: "suggestion",
                profile: {
                  userId: "00000000-0000-0000-0000-000000000011",
                  fullName: "Alex Thompson",
                  major: "Computer Science",
                  year: "Junior",
                  bio: "Passionate about algorithms and system design. Looking for study partners to collaborate on projects.",
                  courses: ["CS 5004", "CS 5008", "CS 5010"],
                  interests: ["Algorithms", "System Design", "Web Development"]
                }
              },
              {
                id: "00000000-0000-0000-0000-000000000022",
                userId1: currentUserId,
                userId2: "00000000-0000-0000-0000-000000000012",
                compatibilityScore: 88,
                status: "suggestion",
                profile: {
                  userId: "00000000-0000-0000-0000-000000000012",
                  fullName: "Jessica Lee",
                  major: "Software Engineering",
                  year: "Senior",
                  bio: "Experienced in full-stack development. Happy to help with web technologies.",
                  courses: ["CS 5002", "CS 5004", "CS 5200"],
                  interests: ["Web Development", "Database Design", "Cloud Computing"]
                }
              },
              {
                id: "00000000-0000-0000-0000-000000000023",
                userId1: currentUserId,
                userId2: "00000000-0000-0000-0000-000000000013",
                compatibilityScore: 85,
                status: "suggestion",
                profile: {
                  userId: "00000000-0000-0000-0000-000000000013",
                  fullName: "David Park",
                  major: "Information Systems",
                  year: "Sophomore",
                  bio: "Interested in data science and machine learning. Let's learn together!",
                  courses: ["CS 5002", "CS 5200", "CS 5800"],
                  interests: ["Data Science", "Machine Learning", "Python"]
                }
              }
            ]);
          }
        }
      } catch (err: any) {
        console.error("[v0] Failed to load data for matches:", err);
        setError(err.message || "Failed to load matches");
        setCompletion(100); // Set to 100 to show dummy matches even on error
        
        // Use dummy data for presentation even on error
        setMatches([
          {
            id: "00000000-0000-0000-0000-000000000021",
            userId1: "current-user",
            userId2: "00000000-0000-0000-0000-000000000011",
            compatibilityScore: 92,
            status: "suggestion",
            profile: {
              userId: "00000000-0000-0000-0000-000000000011",
              fullName: "Alex Thompson",
              major: "Computer Science",
              year: "Junior",
              bio: "Passionate about algorithms and system design. Looking for study partners to collaborate on projects.",
              courses: ["CS 5004", "CS 5008", "CS 5010"],
              interests: ["Algorithms", "System Design", "Web Development"]
            }
          },
          {
            id: "00000000-0000-0000-0000-000000000022",
            userId1: "current-user",
            userId2: "00000000-0000-0000-0000-000000000012",
            compatibilityScore: 88,
            status: "suggestion",
            profile: {
              userId: "00000000-0000-0000-0000-000000000012",
              fullName: "Jessica Lee",
              major: "Software Engineering",
              year: "Senior",
              bio: "Experienced in full-stack development. Happy to help with web technologies.",
              courses: ["CS 5002", "CS 5004", "CS 5200"],
              interests: ["Web Development", "Database Design", "Cloud Computing"]
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConnect = async (matchedUserId: string) => {
    try {
      setConnectingWith(matchedUserId);
      setError("");
      
      console.log("[v0] Creating connection with user:", matchedUserId);
      
      // Check if this is a dummy user (starts with 00000000)
      if (matchedUserId.startsWith("00000000-0000-0000-0000")) {
        console.log("[v0] Dummy user detected, simulating connection");
        
        // Simulate connection for dummy data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Remove the match from the list after connecting
        setMatches(prev => prev.filter(m => {
          const matchUserId = m.userId1 === userId ? m.userId2 : m.userId1;
          return matchUserId !== matchedUserId;
        }));
        
        setSuccessMessage("Connected! You can now chat with this person.");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
        
        return;
      }
      
      // Real API call for actual users
      await connectionService.create({
        userId2: matchedUserId,
        status: "accepted"
      });
      
      console.log("[v0] Connection created successfully");
      
      // Remove the match from the list after connecting
      setMatches(prev => prev.filter(m => {
        const matchUserId = m.userId1 === userId ? m.userId2 : m.userId1;
        return matchUserId !== matchedUserId;
      }));
      
      setSuccessMessage("Connected! Redirecting to chat...");
      
      // Redirect to chat page after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard/chat");
      }, 1500);
      
    } catch (err: any) {
      console.error("[v0] Failed to create connection:", err);
      setError(err.response?.data?.error || err.message || "Failed to connect");
    } finally {
      setConnectingWith(null);
    }
  };

  const handleMessage = (matchedUserId: string) => {
    // Navigate to chat page - the chat page will handle opening the conversation
    router.push(`/dashboard/chat?userId=${matchedUserId}`);
  };

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

        {successMessage && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

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

        {completion >= 100 && matches.length === 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Users className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">
                    Looking for matches...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No matches found yet. Check back soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {completion >= 100 && matches.length > 0 && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>
                  Found {matches.length} potential study {matches.length === 1 ? 'partner' : 'partners'}!
                </span>
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((match: any) => {
                const matchedUserId = match.userId1 === userId ? match.userId2 : match.userId1;
                return (
                  <Card key={match.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{match.profile?.fullName || 'Anonymous User'}</span>
                        <Badge variant="secondary">
                          {Math.round(match.compatibilityScore)}% match
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {match.profile?.major || 'Major not specified'} • Year {match.profile?.year || 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {match.profile?.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {match.profile.bio}
                        </p>
                      )}
                      
                      {match.profile?.courses && match.profile.courses.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-2">Can teach:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.profile.courses.slice(0, 3).map((course: string, idx: number) => (
                              <Badge key={idx} variant="outline">{course}</Badge>
                            ))}
                            {match.profile.courses.length > 3 && (
                              <Badge variant="outline">+{match.profile.courses.length - 3} more</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {match.profile?.interests && match.profile.interests.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-2">Wants to learn:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.profile.interests.slice(0, 3).map((interest: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{interest}</Badge>
                            ))}
                            {match.profile.interests.length > 3 && (
                              <Badge variant="secondary">+{match.profile.interests.length - 3} more</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button 
                          className="flex-1 bg-[#8B1538] hover:bg-[#A91D3A]"
                          onClick={() => handleConnect(matchedUserId)}
                          disabled={connectingWith === matchedUserId}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {connectingWith === matchedUserId ? "Connecting..." : "Connect"}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleMessage(matchedUserId)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
