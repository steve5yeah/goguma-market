"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 거래글에서 "채팅하기"를 눌렀을 때.
 * 이미 방이 있으면 그 방으로, 없으면 새로 만들어서 들어갑니다.
 */
export async function startChat(productId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/products/${productId}`);

  const { data: product } = await supabase
    .from("goguma_products")
    .select("id, seller_id")
    .eq("id", productId)
    .maybeSingle();

  if (!product) redirect("/products");
  // 자기 물건에는 말을 걸 수 없습니다.
  if (product.seller_id === user.id) redirect(`/products/${productId}`);

  const { data: existing } = await supabase
    .from("goguma_chat_rooms")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) redirect(`/chat/${existing.id}`);

  const { data: created, error } = await supabase
    .from("goguma_chat_rooms")
    .insert({
      product_id: productId,
      buyer_id: user.id,
      seller_id: product.seller_id,
    })
    .select("id")
    .single();

  // 같은 순간에 두 번 눌러 방이 겹쳤다면, 이미 만들어진 방으로 보냅니다.
  if (error) {
    const { data: again } = await supabase
      .from("goguma_chat_rooms")
      .select("id")
      .eq("product_id", productId)
      .eq("buyer_id", user.id)
      .maybeSingle();
    if (again) redirect(`/chat/${again.id}`);
    redirect(`/products/${productId}?error=chat`);
  }

  revalidatePath("/chat");
  redirect(`/chat/${created.id}`);
}

export type SendState = { error?: string };

/** 메시지 보내기 */
export async function sendMessage(
  roomId: string,
  _prev: SendState,
  formData: FormData,
): Promise<SendState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return {};
  if (body.length > 1000) return { error: "메시지는 1000자까지 보낼 수 있습니다." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/chat/${roomId}`);

  const { error } = await supabase
    .from("goguma_chat_messages")
    .insert({ room_id: roomId, sender_id: user.id, body });

  // RLS가 막으면(그 방 사람이 아니면) 여기서 걸립니다.
  if (error) return { error: `보내지 못했습니다: ${error.message}` };

  revalidatePath(`/chat/${roomId}`);
  revalidatePath("/chat");
  return {};
}

/** 방에 들어왔을 때 상대가 보낸 메시지를 읽음으로 표시 */
export async function markRead(roomId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("goguma_chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("room_id", roomId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}
