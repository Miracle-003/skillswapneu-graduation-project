"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRequireAuth } from "@/lib/api/hooks/useRequireAuth"
import { ArrowLeft, Bell, MessageSquare, Users, Check, X } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface Notification {
  id: string
  type: "match_request" | "new_message" | "connection_accepted"
  from_user_id: string
  from_user_name: string
  message: string
  created_at: string
  read: boolean
  metadata?: any
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const { user } = useRequireAuth()

  useEffect(() => {
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    try {
      if (!user) return

      const notificationsList: Notification[] = []

      // Load connection requests (match requests)
      // TODO: replace with backend connections service
      const connections: any[] = []
        .select("*, user_profiles!connections_user_id_1_fkey(full_name)")
        .eq("user_id_2", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (connections) {
        connections.forEach((conn) => {
          notificationsList.push({
            id: `conn_${conn.id}`,
            type: "match_request",
            from_user_id: conn.user_id_1,
            from_user_name: conn.user_profiles?.full_name || "Someone",
            message: "wants to connect with you",
            created_at: conn.created_at,
            read: false,
            metadata: { connection_id: conn.id },
          })
        })
      }

      // Load recent messages
      // TODO: replace with backend recent messages service
      const recentMessages: any[] = []
        .select("*, sender:user_profiles!messages_sender_id_fkey(full_name)")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (recentMessages) {
        recentMessages.forEach((msg) => {
          notificationsList.push({
            id: `msg_${msg.id}`,
            type: "new_message",
            from_user_id: msg.sender_id,
            from_user_name: msg.sender?.full_name || "Someone",
            message: msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
            created_at: msg.created_at,
            read: false,
            metadata: { message_id: msg.id },
          })
        })
      }

      // Sort by date
      notificationsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setNotifications(notificationsList)
    } catch (err) {
      console.error("[v0] Error loading notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    // TODO: implement realtime (SSE/WebSocket) later
    // For now, return a no-op unsubscribe function to avoid build/runtime errors.
    return () => {}
  }

  const handleAcceptConnection = async (notificationId: string, connectionId: string) => {
    try {
      const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId)

      if (error) throw error

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      toast.success("Connection accepted!")
    } catch (err) {
      console.error("[v0] Error accepting connection:", err)
      toast.error("Failed to accept connection")
    }
  }

  const handleRejectConnection = async (notificationId: string, connectionId: string) => {
    try {
      const { error } = await supabase.from("connections").delete().eq("id", connectionId)

      if (error) throw error

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      toast.success("Connection rejected")
    } catch (err) {
      console.error("[v0] Error rejecting connection:", err)
      toast.error("Failed to reject connection")
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match_request":
        return <Users className="w-5 h-5 text-[#8B1538]" />
      case "new_message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "connection_accepted":
        return <Check className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>
          <div className="relative">
            <Bell className="w-8 h-8 text-[#8B1538]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {filter === "unread" ? "You're all caught up!" : "You'll see notifications here"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all ${!notification.read ? "border-[#8B1538] bg-[#8B1538]/5" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="mt-1">
                          <AvatarFallback className="bg-[#8B1538] text-white">
                            {getInitials(notification.from_user_name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {getNotificationIcon(notification.type)}
                              <span className="font-semibold">{notification.from_user_name}</span>
                              {!notification.read && <Badge className="bg-[#8B1538] hover:bg-[#A91D3A]">New</Badge>}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>

                          <div className="flex items-center gap-2">
                            {notification.type === "match_request" && (
                              <>
                                <Button
                                  onClick={() =>
                                    handleAcceptConnection(notification.id, notification.metadata.connection_id)
                                  }
                                  size="sm"
                                  className="bg-[#8B1538] hover:bg-[#A91D3A]"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleRejectConnection(notification.id, notification.metadata.connection_id)
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {notification.type === "new_message" && (
                              <Button asChild size="sm" variant="outline">
                                <Link href="/dashboard/chat">View Message</Link>
                              </Button>
                            )}
                            {!notification.read && (
                              <Button onClick={() => markAsRead(notification.id)} size="sm" variant="ghost">
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
