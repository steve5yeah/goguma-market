export type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ChatRoomRow = {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
};

/** 오후 3:24 */
export function chatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** 2026년 9월 21일 월요일 — 날짜가 바뀔 때 구분선에 씁니다 */
export function chatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function isSameDay(a: string, b: string): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}
