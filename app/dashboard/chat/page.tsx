"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, Send, Users } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

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

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
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

  const initializeChat = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)
      await loadConversations(user.id)
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
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Chat with your study partners in real-time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="mb-2">No conversations yet</p>
                    <p className="text-sm">Connect with study partners to start chatting</p>
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

          {/* Messages Area */}
          <Card className="lg:col-span-2 flex flex-col">
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
        </div>
      </main>
    </div>
  )
}
