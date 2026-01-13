"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api/axios-client"
import { ArrowLeft, Send, Users, Heart, X, ChevronUp, ChevronDown, BookOpen } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface Conversation {
  id: string
  participant_name: string
  participant_id: string
  last_message: string
  last_message_time: string
  unread_count: number
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
}

interface PotentialMatch {
  user_id: string
  full_name: string
  major: string
  courses: string[]
  match_score: number
  common_courses: string[]
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState<"chats" | "messages" | "discover">("chats")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (potentialMatches.length === 0) return

      if (e.key === "ArrowLeft" && selectedMatchIndex > 0) {
        setSelectedMatchIndex((prev) => prev - 1)
      } else if (e.key === "ArrowRight" && selectedMatchIndex < potentialMatches.length - 1) {
        setSelectedMatchIndex((prev) => prev + 1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [potentialMatches, selectedMatchIndex])

  const initializeChat = async () => {
    try {
      const { data: userData } = await apiClient.get("/auth/me")
      if (!userData?.user) return

      setCurrentUserId(userData.user.id)
      await Promise.all([loadConversations(), loadPotentialMatches()])
    } catch (err) {
      console.error("Error initializing chat:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      const { data } = await apiClient.get("/messages/conversations")
      if (data && data.length > 0) {
        setConversations(data)
      } else {
        // Use dummy data for presentation (with valid UUID format)
        setConversations([
          {
            id: "00000000-0000-0000-0000-000000000001",
            participant_name: "Sarah Johnson",
            participant_id: "00000000-0000-0000-0000-000000000001",
            last_message: "Thanks for the study session! See you tomorrow.",
            last_message_time: new Date(Date.now() - 3600000).toISOString(),
            unread_count: 0
          },
          {
            id: "00000000-0000-0000-0000-000000000002",
            participant_name: "Michael Chen",
            participant_id: "00000000-0000-0000-0000-000000000002",
            last_message: "Want to practice algorithms together?",
            last_message_time: new Date(Date.now() - 7200000).toISOString(),
            unread_count: 2
          },
          {
            id: "00000000-0000-0000-0000-000000000003",
            participant_name: "Emily Rodriguez",
            participant_id: "00000000-0000-0000-0000-000000000003",
            last_message: "I can help with database design!",
            last_message_time: new Date(Date.now() - 86400000).toISOString(),
            unread_count: 0
          }
        ])
      }
    } catch (err) {
      console.error("Error loading conversations:", err)
      // Fallback to dummy data (with valid UUID format)
      setConversations([
        {
          id: "00000000-0000-0000-0000-000000000001",
          participant_name: "Sarah Johnson",
          participant_id: "00000000-0000-0000-0000-000000000001",
          last_message: "Thanks for the study session! See you tomorrow.",
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 0
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          participant_name: "Michael Chen",
          participant_id: "00000000-0000-0000-0000-000000000002",
          last_message: "Want to practice algorithms together?",
          last_message_time: new Date(Date.now() - 7200000).toISOString(),
          unread_count: 2
        }
      ])
    }
  }

  const loadPotentialMatches = async () => {
    try {
      const { data } = await apiClient.get("/matches/potential")
      if (data && data.length > 0) {
        setPotentialMatches(data)
      } else {
        // Use dummy data for presentation (with valid UUID format)
        setPotentialMatches([
          {
            user_id: "00000000-0000-0000-0000-000000000011",
            full_name: "Alex Thompson",
            major: "Computer Science",
            courses: ["CS 5004", "CS 5008", "CS 5010"],
            match_score: 92,
            common_courses: ["CS 5004", "CS 5008"]
          },
          {
            user_id: "00000000-0000-0000-0000-000000000012",
            full_name: "Jessica Lee",
            major: "Software Engineering",
            courses: ["CS 5002", "CS 5004", "CS 5200"],
            match_score: 88,
            common_courses: ["CS 5004"]
          },
          {
            user_id: "00000000-0000-0000-0000-000000000013",
            full_name: "David Park",
            major: "Information Systems",
            courses: ["CS 5002", "CS 5200", "CS 5800"],
            match_score: 85,
            common_courses: ["CS 5002"]
          }
        ])
      }
    } catch (err) {
      console.error("Error loading potential matches:", err)
      // Fallback to dummy data (with valid UUID format)
      setPotentialMatches([
        {
          user_id: "00000000-0000-0000-0000-000000000011",
          full_name: "Alex Thompson",
          major: "Computer Science",
          courses: ["CS 5004", "CS 5008", "CS 5010"],
          match_score: 92,
          common_courses: ["CS 5004", "CS 5008"]
        }
      ])
    }
  }

  const loadMessages = async (participantId: string) => {
    try {
      const { data } = await apiClient.get(`/messages/${participantId}`)
      if (data && data.length > 0) {
        setMessages(data)
      } else {
        // Use dummy data for presentation (with valid UUID format)
        const dummyMessages = {
          "00000000-0000-0000-0000-000000000001": [
            {
              id: "msg-1",
              sender_id: "00000000-0000-0000-0000-000000000001",
              sender_name: "Sarah Johnson",
              content: "Hey! I saw we're both in CS 5004. Would you like to study together for the upcoming exam?",
              created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: "msg-2",
              sender_id: currentUserId,
              sender_name: "You",
              content: "That sounds great! I'm free this weekend. What topics do you want to focus on?",
              created_at: new Date(Date.now() - 82800000).toISOString()
            },
            {
              id: "msg-3",
              sender_id: "00000000-0000-0000-0000-000000000001",
              sender_name: "Sarah Johnson",
              content: "I'm struggling with object-oriented design patterns. Could we go over that?",
              created_at: new Date(Date.now() - 79200000).toISOString()
            },
            {
              id: "msg-4",
              sender_id: currentUserId,
              sender_name: "You",
              content: "Absolutely! I can also help with inheritance and polymorphism if you need.",
              created_at: new Date(Date.now() - 75600000).toISOString()
            },
            {
              id: "msg-5",
              sender_id: "00000000-0000-0000-0000-000000000001",
              sender_name: "Sarah Johnson",
              content: "Thanks for the study session! See you tomorrow.",
              created_at: new Date(Date.now() - 3600000).toISOString()
            }
          ],
          "00000000-0000-0000-0000-000000000002": [
            {
              id: "msg-6",
              sender_id: "00000000-0000-0000-0000-000000000002",
              sender_name: "Michael Chen",
              content: "Hi! I noticed you're interested in algorithms. Want to practice LeetCode problems together?",
              created_at: new Date(Date.now() - 172800000).toISOString()
            },
            {
              id: "msg-7",
              sender_id: currentUserId,
              sender_name: "You",
              content: "Definitely! I'm working on dynamic programming problems right now.",
              created_at: new Date(Date.now() - 169200000).toISOString()
            },
            {
              id: "msg-8",
              sender_id: "00000000-0000-0000-0000-000000000002",
              sender_name: "Michael Chen",
              content: "Perfect! Want to practice algorithms together?",
              created_at: new Date(Date.now() - 7200000).toISOString()
            }
          ],
          "00000000-0000-0000-0000-000000000003": [
            {
              id: "msg-9",
              sender_id: "00000000-0000-0000-0000-000000000003",
              sender_name: "Emily Rodriguez",
              content: "Hey! Are you taking CS 5200? I could use some help with database normalization.",
              created_at: new Date(Date.now() - 259200000).toISOString()
            },
            {
              id: "msg-10",
              sender_id: currentUserId,
              sender_name: "You",
              content: "Yes I am! I'd be happy to help. When are you free?",
              created_at: new Date(Date.now() - 255600000).toISOString()
            },
            {
              id: "msg-11",
              sender_id: "00000000-0000-0000-0000-000000000003",
              sender_name: "Emily Rodriguez",
              content: "I can help with database design!",
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        }
        setMessages(dummyMessages[participantId as keyof typeof dummyMessages] || [])
      }
    } catch (err) {
      console.error("Error loading messages:", err)
      // Fallback to dummy data
      setMessages([
        {
          id: "msg-1",
          sender_id: participantId,
          sender_name: "Study Partner",
          content: "Hey! Let's study together!",
          created_at: new Date().toISOString()
        }
      ])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    // Create the new message object for immediate UI update
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_id: currentUserId,
      sender_name: "You",
      content: newMessage.trim(),
      created_at: new Date().toISOString()
    }

    // Add message to UI immediately
    setMessages((prev) => [...prev, newMsg])
    setNewMessage("")

    try {
      // Try to send to backend
      await apiClient.post("/messages", {
        receiverId: selectedConversation,
        content: newMsg.content,
      })
    } catch (err) {
      console.error("Error sending message:", err)
      // Message already added to UI, so just log the error
      // In a real app, you might want to show a "failed to send" indicator
    }
  }

  const handleConnectMatch = async (matchUserId: string) => {
    try {
      await apiClient.post("/connections", {
        userId2: matchUserId,
      })

      toast.success("Connected! You can now chat with this person.")
      await loadConversations()
      setPotentialMatches((prev) => prev.filter((m) => m.user_id !== matchUserId))
    } catch (err) {
      console.error("Error connecting:", err)
      toast.error("Failed to connect")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const currentMatch = potentialMatches[selectedMatchIndex]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages & Discovery</h1>
          <p className="text-muted-foreground">Chat with connections and discover new study partners</p>
        </div>

        {/* Mobile view selector - shown only on small screens */}
        <div className="lg:hidden flex gap-2 mb-4">
          <Button
            variant={mobileView === "chats" ? "default" : "outline"}
            onClick={() => setMobileView("chats")}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Chats
          </Button>
          <Button
            variant={mobileView === "messages" ? "default" : "outline"}
            onClick={() => setMobileView("messages")}
            className="flex-1"
            disabled={!selectedConversation}
          >
            <Send className="w-4 h-4 mr-2" />
            Messages
          </Button>
          <Button
            variant={mobileView === "discover" ? "default" : "outline"}
            onClick={() => setMobileView("discover")}
            className="flex-1"
          >
            <Heart className="w-4 h-4 mr-2" />
            Discover
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 h-[70vh] sm:h-[80vh] md:h-[700px]">
          {/* Left: Conversations List */}
          <Card className={`lg:col-span-3 ${mobileView !== "chats" ? "hidden lg:block" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Chats ({conversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[55vh] sm:h-[65vh] md:h-[600px]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="mb-2">No conversations yet</p>
                    <p className="text-sm">Connect with matches to start chatting</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv.id)
                        // Switch to messages view on mobile when conversation is selected
                        setMobileView("messages")
                      }}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-muted transition-colors border-b ${
                        selectedConversation === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-[#8B1538] text-white">
                          {getInitials(conv.participant_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{conv.participant_name}</span>
                          <div className="flex items-center gap-2">
                            {conv.unread_count > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
                                {conv.unread_count}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{conv.last_message}</p>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Center: Messages Area */}
          <Card className={`lg:col-span-5 flex flex-col ${mobileView !== "messages" ? "hidden lg:flex" : ""}`}>
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setMobileView("chats")}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Avatar>
                      <AvatarFallback className="bg-[#8B1538] text-white">
                        {getInitials(conversations.find((c) => c.id === selectedConversation)?.participant_name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    {conversations.find((c) => c.id === selectedConversation)?.participant_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 flex flex-col">
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_id === currentUserId ? "bg-[#8B1538] text-white" : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage} className="bg-[#8B1538] hover:bg-[#A91D3A]">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Right: Potential Matches Discovery */}
          <Card className={`lg:col-span-4 ${mobileView !== "discover" ? "hidden lg:block" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#8B1538]" />
                Discover ({potentialMatches.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground">Use left/right arrows to browse</p>
            </CardHeader>
            <CardContent className="p-4">
              {potentialMatches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No new matches available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setSelectedMatchIndex((prev) => Math.max(0, prev - 1))}
                      disabled={selectedMatchIndex === 0}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedMatchIndex + 1} / {potentialMatches.length}
                    </span>
                    <Button
                      onClick={() => setSelectedMatchIndex((prev) => Math.min(potentialMatches.length - 1, prev + 1))}
                      disabled={selectedMatchIndex === potentialMatches.length - 1}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Match Card */}
                  {currentMatch && (
                    <div className="border-2 rounded-lg p-4 space-y-4">
                      <div className="text-center">
                        <Avatar className="w-20 h-20 mx-auto mb-3">
                          <AvatarFallback className="bg-[#8B1538] text-white text-2xl">
                            {getInitials(currentMatch.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">{currentMatch.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{currentMatch.major}</p>
                        <Badge className="mt-2 bg-green-500 hover:bg-green-600">
                          {currentMatch.match_score}% Match
                        </Badge>
                      </div>

                      {currentMatch.common_courses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#8B1538]" />
                            Common Courses
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {currentMatch.common_courses.map((course) => (
                              <Badge key={course} variant="secondary" className="text-xs">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedMatchIndex((prev) => prev + 1)}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Pass
                        </Button>
                        <Button
                          onClick={() => handleConnectMatch(currentMatch.user_id)}
                          className="flex-1 bg-[#8B1538] hover:bg-[#A91D3A]"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
