"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Download, MessageSquare, Smartphone, Globe, User, Bot } from "lucide-react";

import { DateFilter } from "@/components/dashboard/date-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ThreadMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ConversationRow = {
  id: string;
  channel: "website" | "whatsapp";
  visitor_id: string | null;
  started_at: string;
  ended_at: string | null;
  thread: ThreadMessage[];
  userMessage: string;
  aiReply: string;
  messageCount: number;
};

type ConversationsBoardProps = {
  companyName: string;
  conversations: ConversationRow[];
  currentChannel: "all" | "website" | "whatsapp";
  currentDate: string | null;
};

const channelOptions = [
  { value: "all", label: "All conversations", icon: MessageSquare },
  { value: "website", label: "Web conversations", icon: Globe },
  { value: "whatsapp", label: "WhatsApp conversations", icon: Smartphone },
] as const;

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function ConversationsBoard({
  companyName,
  conversations,
  currentChannel,
  currentDate,
}: ConversationsBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateChannel = (channel: "all" | "website" | "whatsapp") => {
    const params = new URLSearchParams(searchParams.toString());

    if (channel === "all") {
      params.delete("channel");
    } else {
      params.set("channel", channel);
    }

    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const exportCsv = () => {
    const rows = [
      [
        "conversation_id",
        "channel",
        "contact",
        "started_at",
        "message_count",
        "user_message",
        "ai_reply",
        "thread",
      ],
      ...conversations.map((conversation) => [
        conversation.id,
        conversation.channel,
        conversation.visitor_id || "",
        conversation.started_at,
        String(conversation.messageCount),
        conversation.userMessage,
        conversation.aiReply,
        conversation.thread
          .map(
            (message) =>
              `${message.role.toUpperCase()}: ${message.content.replace(/\n/g, " ")}`,
          )
          .join(" | "),
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${companyName.toLowerCase().replace(/\s+/g, "-")}-conversations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
            <p className="text-muted-foreground">
              View web and WhatsApp conversations with full user and AI replies.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <DateFilter value={currentDate} />
          <Button
            onClick={exportCsv}
            className="rounded-full bg-[#1f1a17] text-[#fff7ef] hover:bg-[#3b312b]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Conversation Inbox</CardTitle>
              <CardDescription>
                Showing {conversations.length} conversation
                {conversations.length === 1 ? "" : "s"} for {companyName}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {currentDate ? format(parseISO(currentDate), "PPP") : "All dates"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {channelOptions.map((option) => {
              const Icon = option.icon;
              const active = currentChannel === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => updateChannel(option.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-[#a54d2d] bg-[#f7ecdf] text-[#7b4b2c]"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {conversations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-secondary/30 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-background">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No conversations match this filter</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another date or switch between web and WhatsApp conversations.
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <article
                key={conversation.id}
                className="rounded-[1.75rem] border border-border/60 bg-[#fffaf3] p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full bg-[#f7ecdf] text-[#7b4b2c] hover:bg-[#f7ecdf]">
                        {conversation.channel === "whatsapp" ? "WhatsApp" : "Web"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {conversation.visitor_id ? conversation.visitor_id : "Unknown contact"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Started {format(parseISO(conversation.started_at), "PPP p")}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-secondary/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Messages
                      </p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {conversation.messageCount}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-secondary/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        User message
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground">
                        {conversation.userMessage || "No user message found"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-secondary/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        AI reply
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground">
                        {conversation.aiReply || "No AI reply found"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-border/60 pt-4">
                  {conversation.thread.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages recorded.</p>
                  ) : (
                    conversation.thread.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "rounded-2xl border p-4",
                          message.role === "assistant"
                            ? "border-accent/20 bg-accent/10"
                            : "border-primary/20 bg-primary/10",
                        )}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {message.role === "assistant" ? (
                              <Bot className="h-4 w-4 text-accent" />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )}
                            {message.role === "assistant" ? "AI Reply" : "User Message"}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(message.created_at), "PPP p")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                          {message.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
