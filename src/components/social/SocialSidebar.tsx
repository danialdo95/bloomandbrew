import { TrendTags } from "@/components/TrendTags";
import type { ChatMessage, NotificationItem } from "@/types/social";

type SocialSidebarProps = {
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];
  chatDraft: string;
  live: boolean;
  trends: Array<{ label: string; count: number }>;
  source: "reddit" | "fallback";
  onChatDraftChange: (value: string) => void;
  onSendChat: () => void;
  onToggleLive: () => void;
};

export function SocialSidebar({
  notifications,
  chatMessages,
  chatDraft,
  live,
  trends,
  source,
  onChatDraftChange,
  onSendChat,
  onToggleLive,
}: SocialSidebarProps) {
  return (
    <aside className="space-y-5">
      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-[#211f1d]">Notifications</h2>
          <span className="rounded-full bg-[#fff176] px-2 py-1 text-xs font-black">
            {notifications.length}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-[6px] bg-[#fff8f2] p-3">
              <p className="text-sm font-bold leading-6 text-[#211f1d]">{item.text}</p>
              <p className="mt-1 text-xs font-bold text-[#8a7d73]">{item.createdAt}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <h2 className="font-black text-[#211f1d]">In-app chat</h2>
        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`rounded-[6px] px-3 py-2 text-sm font-bold leading-6 ${
                message.from === "me"
                  ? "ml-8 bg-[#211f1d] text-white"
                  : "mr-8 bg-[#fff8f2] text-[#211f1d]"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={chatDraft}
            onChange={(event) => onChatDraftChange(event.target.value)}
            placeholder="Message..."
            className="h-10 min-w-0 flex-1 rounded-full border border-[#eadfd4] bg-[#fffaf6] px-4 text-sm font-bold"
          />
          <button
            type="button"
            onClick={onSendChat}
            className="rounded-full bg-[#c45572] px-4 text-sm font-black text-white"
          >
            Send
          </button>
        </div>
      </section>

      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-[#211f1d]">Live room</h2>
            <p className="mt-1 text-sm font-bold text-[#6f6259]">
              Stream a bouquet build or cafe visit.
            </p>
          </div>
          <span className={`h-3 w-3 rounded-full ${live ? "bg-red-500" : "bg-[#d8c8bc]"}`} />
        </div>
        <button
          type="button"
          onClick={onToggleLive}
          className="mt-4 w-full rounded-full bg-[#211f1d] px-4 py-3 text-sm font-black text-white"
        >
          {live ? "End live" : "Start live"}
        </button>
      </section>

      <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
        <h2 className="font-black text-[#211f1d]">Trending now</h2>
        <div className="mt-4">
          <TrendTags trends={trends} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#8a7d73]">
          Source: {source === "reddit" ? "Live Reddit feed" : "Fallback demo feed"}
        </p>
      </section>
    </aside>
  );
}
