import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, formatPrice, type ProductStatus } from "@/lib/products";
import type { ChatMessage } from "@/lib/chat";
import ChatRoom from "../ChatRoom";

type Params = Promise<{ roomId: string }>;

type Room = {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  goguma_products: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    status: ProductStatus;
  } | null;
  buyer: { nickname: string } | null;
  seller: { nickname: string } | null;
};

export const metadata = { title: "채팅 — 고구마마켓" };

export default async function ChatRoomPage({ params }: { params: Params }) {
  const { roomId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(roomId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/chat/${roomId}`);

  // RLS 덕분에 내가 낀 방이 아니면 애초에 읽히지 않습니다.
  const { data } = await supabase
    .from("goguma_chat_rooms")
    .select(
      `id, product_id, buyer_id, seller_id,
       goguma_products(id, title, price, image_url, status),
       buyer:goguma_profiles!goguma_chat_rooms_buyer_id_fkey(nickname),
       seller:goguma_profiles!goguma_chat_rooms_seller_id_fkey(nickname)`,
    )
    .eq("id", roomId)
    .maybeSingle();

  const room = data as unknown as Room | null;
  if (!room) notFound();

  const { data: messageRows } = await supabase
    .from("goguma_chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  const iAmSeller = room.seller_id === user.id;
  const other = iAmSeller ? room.buyer : room.seller;
  const product = room.goguma_products;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/chat" className="text-sm text-soil-600 hover:underline">
          ← 채팅 목록
        </Link>
        <h1 className="font-bold text-soil-900">
          {other?.nickname ?? "탈퇴한 사용자"}
        </h1>
        <span className="rounded-md bg-soil-100 px-1.5 py-0.5 text-[0.7rem] text-soil-600">
          {iAmSeller ? "구매 문의" : "판매자"}
        </span>
      </div>

      {product ? (
        <Link
          href={`/products/${product.id}`}
          className="card flex items-center gap-3 p-3 transition hover:border-goguma-300"
        >
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-goguma-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
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
            <p className="truncate text-sm text-soil-900">{product.title}</p>
            <p className="font-bold text-soil-900">{formatPrice(product.price)}</p>
          </div>
          {product.status !== "selling" && (
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${STATUSES[product.status].className}`}
            >
              {STATUSES[product.status].label}
            </span>
          )}
        </Link>
      ) : (
        <p className="rounded-2xl border border-dashed border-soil-200 p-4 text-center text-sm text-soil-400">
          삭제된 거래글입니다.
        </p>
      )}

      <ChatRoom
        roomId={room.id}
        myId={user.id}
        otherNickname={other?.nickname ?? "상대방"}
        initialMessages={(messageRows ?? []) as ChatMessage[]}
      />
    </div>
  );
}
