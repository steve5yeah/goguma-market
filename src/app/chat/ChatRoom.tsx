"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { chatDay, chatTime, isSameDay, type ChatMessage } from "@/lib/chat";
import { markRead, sendMessage, type SendState } from "./actions";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-xl bg-goguma-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-goguma-600 disabled:bg-goguma-300"
    >
      보내기
    </button>
  );
}

type Props = {
  roomId: string;
  myId: string;
  otherNickname: string;
  initialMessages: ChatMessage[];
};

export default function ChatRoom({
  roomId,
  myId,
  otherNickname,
  initialMessages,
}: Props) {
  // 실시간으로 도착한 메시지만 따로 모아 둡니다.
  // 서버에서 내려온 initialMessages와 합쳐서 보여 주기 때문에,
  // 서버 목록이 갱신되면 그 값이 그대로 반영됩니다.
  const [live, setLive] = useState<ChatMessage[]>([]);

  const messages = useMemo(() => {
    const byId = new Map<string, ChatMessage>();
    for (const m of initialMessages) byId.set(m.id, m);
    for (const m of live) if (!byId.has(m.id)) byId.set(m.id, m);
    return [...byId.values()].sort((a, b) =>
      a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
    );
  }, [initialMessages, live]);

  const [state, formAction] = useActionState(
    sendMessage.bind(null, roomId),
    {} as SendState,
  );

  // 보내는 즉시 내 말풍선을 먼저 띄웁니다. 서버 응답이 오면 진짜 값으로 바뀝니다.
  const [shown, addOptimistic] = useOptimistic(
    messages,
    (list, body: string): ChatMessage[] => [
      ...list,
      {
        id: `temp-${Date.now()}`,
        room_id: roomId,
        sender_id: myId,
        body,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ],
  );

  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [shown.length]);

  // 실시간 구독 — 상대가 보낸 메시지가 새로고침 없이 바로 뜹니다.
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // 이 표는 본인이 낀 방만 볼 수 있게 잠겨 있어서,
      // 실시간 연결에도 내 로그인 토큰을 알려 줘야 메시지가 옵니다.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      channel = supabase
        .channel(`goguma-chat-${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "goguma_chat_messages",
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const row = payload.new as ChatMessage;
            setLive((prev) =>
              prev.some((m) => m.id === row.id) ? prev : [...prev, row],
            );
            if (row.sender_id !== myId) void markRead(roomId);
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [roomId, myId]);

  // 방에 들어온 순간, 안 읽은 상대 메시지를 읽음으로 표시
  useEffect(() => {
    void markRead(roomId);
  }, [roomId]);

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="flex-1 space-y-3 py-4">
        {shown.length === 0 && (
          <p className="py-16 text-center text-sm text-soil-400">
            {otherNickname}님에게 첫 메시지를 보내 보세요.
          </p>
        )}

        {shown.map((m, i) => {
          const mine = m.sender_id === myId;
          const showDay =
            i === 0 || !isSameDay(m.created_at, shown[i - 1].created_at);

          return (
            <div key={m.id}>
              {showDay && (
                <p className="my-4 text-center text-xs text-soil-400">
                  {chatDay(m.created_at)}
                </p>
              )}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex max-w-[78%] items-end gap-1.5 ${
                    mine ? "flex-row-reverse" : ""
                  }`}
                >
                  <p
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      mine
                        ? "rounded-br-md bg-goguma-500 text-white"
                        : "rounded-bl-md border border-soil-200 bg-white text-soil-900"
                    }`}
                  >
                    {m.body}
                  </p>
                  <span className="shrink-0 pb-0.5 text-[0.65rem] text-soil-400">
                    {mine && !m.read_at && (
                      <span className="mr-1 font-bold text-goguma-500">1</span>
                    )}
                    {chatTime(m.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {state.error && (
        <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <form
        ref={formRef}
        action={(formData) => {
          const body = String(formData.get("body") ?? "").trim();
          if (!body) return;
          addOptimistic(body);
          formAction(formData);
        }}
        className="sticky bottom-0 flex gap-2 border-t border-soil-200 bg-goguma-50/95 py-3 backdrop-blur"
      >
        <input
          name="body"
          type="text"
          autoComplete="off"
          maxLength={1000}
          placeholder="메시지를 입력하세요"
          className="field flex-1"
        />
        <SendButton />
      </form>
    </div>
  );
}
