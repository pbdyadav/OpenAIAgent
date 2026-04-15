import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConversationsBoard, type ConversationRow } from "@/components/dashboard/conversations-board";

type SearchParams = {
  date?: string;
  channel?: string;
};

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const params = (await searchParams) || {};

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Company not created yet</h2>
        <p className="text-muted-foreground mt-2">
          Please create your company first to use Knowledge Base.
        </p>
      </div>
    );
  }

  const selectedDate = params.date ? new Date(params.date) : null;
  const hasSelectedDate = !!selectedDate && !Number.isNaN(selectedDate.getTime());
  const rangeStart = hasSelectedDate ? new Date(selectedDate!) : null;
  const rangeEnd = hasSelectedDate ? new Date(selectedDate!) : null;

  if (rangeStart) rangeStart.setHours(0, 0, 0, 0);
  if (rangeEnd) rangeEnd.setHours(23, 59, 59, 999);

  let conversationsQuery = supabase
    .from("conversations")
    .select("id, company_id, channel, visitor_id, started_at, ended_at")
    .eq("company_id", company.id);

  if (params.channel === "website" || params.channel === "whatsapp") {
    conversationsQuery = conversationsQuery.eq("channel", params.channel);
  }

  if (hasSelectedDate) {
    conversationsQuery = conversationsQuery
      .gte("started_at", rangeStart!.toISOString())
      .lte("started_at", rangeEnd!.toISOString());
  }

  const { data: conversations } = await conversationsQuery.order("started_at", {
    ascending: false,
  });

  const conversationIds = (conversations || []).map((conversation) => conversation.id);

  type ThreadMessage = {
    id: string;
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  };

  const { data: messages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("id, conversation_id, role, content, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: true })
    : { data: [] as ThreadMessage[] };

  const messagesByConversation = (messages || []).reduce(
    (acc, message) => {
      if (!acc[message.conversation_id]) {
        acc[message.conversation_id] = [];
      }

      acc[message.conversation_id].push(message);
      return acc;
    },
    {} as Record<string, ThreadMessage[]>,
  );

  const conversationRows: ConversationRow[] = (conversations || []).map((conversation) => {
    const thread = messagesByConversation[conversation.id] || [];
    const userMessages = thread.filter((message) => message.role === "user");
    const aiMessages = thread.filter((message) => message.role === "assistant");

    return {
      ...conversation,
      thread,
      userMessage: userMessages[userMessages.length - 1]?.content || "",
      aiReply: aiMessages[aiMessages.length - 1]?.content || "",
      messageCount: thread.length,
    };
  });

  return (
    <ConversationsBoard
      companyName={company.name}
      conversations={conversationRows}
      currentChannel={params.channel || "all"}
      currentDate={hasSelectedDate ? params.date || null : null}
    />
  );
}
