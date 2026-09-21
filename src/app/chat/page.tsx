import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/products";

export const metadata = { title: "채팅 — 고구마마켓" };

type RoomListItem = {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  goguma_products: {
    title: string;
    price: number;
    image_url: string | null;
    status: string;
  } | null;
  buyer: { nickname: string } | null;
  seller: { nickname: string } | null;
};

export default async function ChatListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat");

  // 내가 낀 방만 보입니다 (RLS가 한 번, 아래 조건이 한 번 더 걸러 줍니다)
  const { data } = await supabase
    .from("goguma_chat_rooms")
    .select(
      `id, buyer_id, seller_id, last_message, last_message_at, created_at,
       goguma_products(title, price, image_url, status),
       buyer:goguma_profiles!goguma_chat_rooms_buyer_id_fkey(nickname),
       seller:goguma_profiles!goguma_chat_rooms_seller_id_fkey(nickname)`,
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const rooms = (data ?? []) as unknown as RoomListItem[];

  // 방마다 내가 안 읽은 메시지 개수
  const unread = new Map<string, number>();
  if (rooms.length > 0) {
    const { data: pending } = await supabase
      .from("goguma_chat_messages")
      .select("room_id")
      .in(
        "room_id",
        rooms.map((r) => r.id),
      )
      .neq("sender_id", user.id)
      .is("read_at", null);

    for (const m of pending ?? []) {
      unread.set(m.room_id, (unread.get(m.room_id) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-soil-900">채팅</h1>

      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-soil-200 px-4 py-16 text-center">
          <p className="text-3xl">💬</p>
          <p className="mt-3 text-soil-600">아직 주고받은 대화가 없습니다.</p>
          <p className="mt-1 text-sm text-soil-400">
            마음에 드는 물건에서 &ldquo;채팅하기&rdquo;를 눌러 보세요.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-xl bg-goguma-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-goguma-600"
          >
            물건 구경하기
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-soil-100 overflow-hidden rounded-2xl border border-soil-200 bg-white">
          {rooms.map((room) => {
            const iAmSeller = room.seller_id === user.id;
            const other = iAmSeller ? room.buyer : room.seller;
            const count = unread.get(room.id) ?? 0;

            return (
              <li key={room.id}>
                <Link
                  href={`/chat/${room.id}`}
                  className="flex items-center gap-3 p-4 transition hover:bg-goguma-50"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-goguma-100">
                    {room.goguma_products?.image_url ? (
                      <Image
                        src={room.goguma_products.image_url}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xl">
                        🍠
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-soil-900">
                        {other?.nickname ?? "탈퇴한 사용자"}
                      </p>
                      <span className="shrink-0 rounded-md bg-soil-100 px-1.5 py-0.5 text-[0.7rem] text-soil-600">
                        {iAmSeller ? "구매 문의" : "판매자"}
                      </span>
                      {room.last_message_at && (
                        <span className="ml-auto shrink-0 text-xs text-soil-400">
                          {timeAgo(room.last_message_at)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-soil-600">
                      {room.last_message ?? "대화를 시작해 보세요"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-soil-400">
                      {room.goguma_products?.title ?? "삭제된 글"}
                      {room.goguma_products &&
                        ` · ${formatPrice(room.goguma_products.price)}`}
                    </p>
                  </div>

                  {count > 0 && (
                    <span className="shrink-0 rounded-full bg-goguma-500 px-2 py-1 text-xs font-bold text-white">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
