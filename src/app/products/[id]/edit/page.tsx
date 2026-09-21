import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";
import ProductForm from "../../ProductForm";

export const metadata = { title: "글 수정 — 고구마마켓" };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/products/${id}/edit`);

  const { data } = await supabase
    .from("goguma_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const product = data as Product | null;
  if (!product) notFound();

  // 남의 글은 수정할 수 없습니다. (DB의 RLS와 이중으로 막습니다)
  if (product.seller_id !== user.id) redirect(`/products/${id}`);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-soil-900">글 수정</h1>
      <ProductForm product={product} />
    </div>
  );
}
