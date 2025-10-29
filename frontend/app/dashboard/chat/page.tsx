"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
      subscribeToMessages(selectedConversation)
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)
      await Promise.all([loadConversations(user.id), loadPotentialMatches(user.id)])
    } catch (err) {
      console.error("[v0] Error initializing chat:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadConversations = async (userId: string) => {
    try {
      const { data: connections } = await supabase
        .from("connections")
        .select("*, user_profiles!connections_user_id_2_fkey(*)")
        .eq("user_id_1", userId)
        .eq("status", "accepted")

      if (!connections) return

      const conversationList: Conversation[] = await Promise.all(
        connections.map(async (conn) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("*")
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .or(`sender_id.eq.${conn.user_id_2},receiver_id.eq.${conn.user_id_2}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          return {
            id: conn.user_id_2,
            participant_name: conn.user_profiles.full_name || "Unknown User",
            participant_id: conn.user_id_2,
            last_message: lastMsg?.content || "No messages yet",
            last_message_time: lastMsg?.created_at || conn.created_at,
            unread_count: 0,
          }
        }),
      )

      setConversations(conversationList)
    } catch (err) {
      console.error("[v0] Error loading conversations:", err)
    }
  }

  const loadPotentialMatches = async (userId: string) => {
    try {
      const { data: currentProfile } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

      if (!currentProfile) return

      const { data: existingConnections } = await supabase
        .from("connections")
        .select("user_id_2")
        .eq("user_id_1", userId)

      const connectedIds = existingConnections?.map((c) => c.user_id_2) || []

      const { data: allProfiles } = await supabase.from("user_profiles").select("*").neq("user_id", userId).limit(20)

      if (!allProfiles) return

      const matches = allProfiles
        .map((profile) => {
          const commonCourses = profile.courses.filter((course: string) => currentProfile.courses.includes(course))
          let score = commonCourses.length * 30
          score += profile.major === currentProfile.major ? 20 : 0

          return {
            user_id: profile.user_id,
            full_name: profile.full_name,
            major: profile.major,
            courses: profile.courses,
            match_score: Math.min(score, 100),
            common_courses: commonCourses,
          }
        })
        .filter((profile) => profile.match_score > 0 && !connectedIds.includes(profile.user_id))
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 10)

      setPotentialMatches(matches)
    } catch (err) {
      console.error("[v0] Error loading potential matches:", err)
    }
  }

  const loadMessages = async (participantId: string) => {
    try {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:user_profiles!messages_sender_id_fkey(full_name)")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${participantId})`)
        .or(`and(sender_id.eq.${participantId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true })

      if (data) {
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: msg.sender?.full_name || "Unknown",
          content: msg.content,
          created_at: msg.created_at,
        }))
        setMessages(formattedMessages)
      }
    } catch (err) {
      console.error("[v0] Error loading messages:", err)
    }
  }

  const subscribeToMessages = (participantId: string) => {
    const channel = supabase
      .channel(`messages:${currentUserId}:${participantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const { data: senderProfile } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("user_id", payload.new.sender_id)
            .single()

          const newMsg: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            sender_name: senderProfile?.full_name || "Unknown",
            content: payload.new.content,
            created_at: payload.new.created_at,
          }

          setMessages((prev) => [...prev, newMsg])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const { data: senderProfile } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", currentUserId)
        .single()

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedConversation,
          content: newMessage.trim(),
        })
        .select()
        .single()

      if (error) throw error

      const newMsg: Message = {
        id: data.id,
        sender_id: currentUserId,
        sender_name: senderProfile?.full_name || "You",
        content: data.content,
        created_at: data.created_at,
      }

      setMessages((prev) => [...prev, newMsg])
      setNewMessage("")
    } catch (err) {
      console.error("[v0] Error sending message:", err)
    }
  }

  const handleConnectMatch = async (matchUserId: string) => {
    try {
      const { error } = await supabase.from("connections").insert({
        user_id_1: currentUserId,
        user_id_2: matchUserId,
        status: "accepted",
      })

      if (error) throw error

      toast.success("Connected! You can now chat with this person.")
      await loadConversations(currentUserId)
      setPotentialMatches((prev) => prev.filter((m) => m.user_id !== matchUserId))
    } catch (err) {
      console.error("[v0] Error connecting:", err)
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

        <div className="grid lg:grid-cols-12 gap-6 h-[70vh] sm:h-[80vh] md:h-[700px]">
          {/* Left: Conversations List */}
          <Card className="lg:col-span-3">
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
                      onClick={() => setSelectedConversation(conv.id)}
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
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                          </span>
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
          <Card className="lg:col-span-5 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
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
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#8B1538]" />
                Discover ({potentialMatches.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground">Use ← → arrows to browse</p>
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
