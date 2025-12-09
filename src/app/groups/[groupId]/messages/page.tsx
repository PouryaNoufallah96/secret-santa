"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  MessageSquare,
  Gift,
  User,
} from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { MessageInput } from "@/components/messages/message-input";
import { MessageThread } from "@/components/messages/message-thread";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";

interface Message {
  id: string;
  assignmentId: string;
  senderType: "santa" | "recipient";
  content: string;
  isRead: boolean;
  createdAt: string;
  thread: "santa" | "recipient";
  displayName: string;
  isMine: boolean;
}

interface MessagesData {
  messages: Message[];
  canMessageAsSanta: boolean;
  canMessageAsRecipient: boolean;
  giverAssignmentId: string | null;
  receiverAssignmentId: string | null;
}

export default function MessagesPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<MessagesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"santa" | "recipient">("santa");

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You are not a member of this group");
        }
        if (res.status === 404) {
          throw new Error("Group not found");
        }
        throw new Error("Failed to fetch messages");
      }
      const data = await res.json();
      setData(data);

      // Set initial tab based on what's available
      if (!data.canMessageAsSanta && data.canMessageAsRecipient) {
        setActiveTab("recipient");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!session) return;
    fetchMessages();
  }, [session, fetchMessages]);

  const handleSendMessage = async (content: string, senderRole: "santa" | "recipient") => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, senderRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      // Refresh messages
      await fetchMessages();
    } catch (err) {
      throw err;
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-red" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to view messages
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-red" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button asChild>
            <Link href={`/groups/${groupId}`}>Back to Group</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const santaMessages = data.messages.filter((m) => m.thread === "santa");
  const recipientMessages = data.messages.filter((m) => m.thread === "recipient");

  const showTabs = data.canMessageAsSanta && data.canMessageAsRecipient;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Group
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-christmas-red/10 rounded-lg">
          <MessageSquare className="h-6 w-6 text-christmas-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Anonymous Messages</h1>
          <p className="text-muted-foreground">
            Send secret messages without revealing your identity
          </p>
        </div>
      </div>

      {!data.canMessageAsSanta && !data.canMessageAsRecipient ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No assignments yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Anonymous messaging will be available after the Secret Santa draw is complete.
            </p>
            <Button asChild>
              <Link href={`/groups/${groupId}`}>Back to Group</Link>
            </Button>
          </CardContent>
        </Card>
      ) : showTabs ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "santa" | "recipient")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="santa" className="gap-2">
              <Gift className="h-4 w-4" />
              As Secret Santa
            </TabsTrigger>
            <TabsTrigger value="recipient" className="gap-2">
              <User className="h-4 w-4" />
              As Recipient
            </TabsTrigger>
          </TabsList>

          <TabsContent value="santa" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Message Your Gift Recipient</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask questions about their wishlist or drop hints about their gift!
                </p>
              </CardHeader>
              <CardContent>
                <MessageThread
                  messages={santaMessages}
                  emptyMessage="No messages yet. Start a conversation with your recipient!"
                />
                <div className="mt-4">
                  <MessageInput
                    onSend={(content) => handleSendMessage(content, "santa")}
                    placeholder="Type a message to your recipient..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipient" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Message Your Secret Santa</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Thank them or share more about what you&apos;d like!
                </p>
              </CardHeader>
              <CardContent>
                <MessageThread
                  messages={recipientMessages}
                  emptyMessage="No messages from your Secret Santa yet."
                />
                <div className="mt-4">
                  <MessageInput
                    onSend={(content) => handleSendMessage(content, "recipient")}
                    placeholder="Type a message to your Secret Santa..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : data.canMessageAsSanta ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-christmas-red" />
              Message Your Gift Recipient
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask questions about their wishlist or drop hints about their gift!
            </p>
          </CardHeader>
          <CardContent>
            <MessageThread
              messages={santaMessages}
              emptyMessage="No messages yet. Start a conversation with your recipient!"
            />
            <div className="mt-4">
              <MessageInput
                onSend={(content) => handleSendMessage(content, "santa")}
                placeholder="Type a message to your recipient..."
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-christmas-green" />
              Message Your Secret Santa
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Thank them or share more about what you&apos;d like!
            </p>
          </CardHeader>
          <CardContent>
            <MessageThread
              messages={recipientMessages}
              emptyMessage="No messages from your Secret Santa yet."
            />
            <div className="mt-4">
              <MessageInput
                onSend={(content) => handleSendMessage(content, "recipient")}
                placeholder="Type a message to your Secret Santa..."
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
