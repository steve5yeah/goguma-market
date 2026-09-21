import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  STATUSES,
  formatPrice,
  timeAgo,
  type ProductWithSeller,
} from "@/lib/products";
import DeleteButton from "../DeleteButton";
import StatusButtons from "../StatusButtons";

type Params = Promise<{ id: string }>;

async function loadProduct(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goguma_products")
    .select("*, goguma_profiles(nickname, region)")
    .eq("id", id)
    .maybeSingle();
  return data as (ProductWithSeller & { goguma_profiles: { nickname: string; region: string | null } | null }) | null;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const product = await loadProduct(id);
  return { title: product ? `${product.title} — 고구마마켓` : "고구마마켓" };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  // 잘못된 uuid가 들어오면 조회 자체가 실패하므로 먼저 막습니다.
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const product = await loadProduct(id);
  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === product.seller_id;
  const status = STATUSES[product.status];

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <Link href="/products" className="inline-block text-sm text-soil-600 hover:underline">
        ← 목록으로
      </Link>

      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-goguma-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className={`object-cover ${product.status === "sold" ? "opacity-60" : ""}`}
            priority
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-6xl">🍠</span>
        )}
        {product.status !== "selling" && (
          <span
            className={`absolute left-4 top-4 rounded-lg px-2.5 py-1 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-soil-200 bg-white p-4">
        <div className="flex size-11 items-center justify-center rounded-full bg-goguma-100 text-xl">
          🍠
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-soil-900">
            {product.goguma_profiles?.nickname ?? "탈퇴한 사용자"}
          </p>
          <p className="text-sm text-soil-600">
            {product.region ?? product.goguma_profiles?.region ?? "동네 미설정"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-soil-600">
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:underline"
          >
            {product.category}
          </Link>
          {" · "}
          {timeAgo(product.created_at)}
          {product.updated_at !== product.created_at && " (수정됨)"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-soil-900">{product.title}</h1>
        <p className="mt-2 text-2xl font-bold text-goguma-600">
          {formatPrice(product.price)}
        </p>
      </div>

      <p className="whitespace-pre-wrap leading-relaxed text-soil-800">
        {product.description}
      </p>

      {isOwner ? (
        <div className="space-y-4 rounded-2xl border border-goguma-200 bg-goguma-50 p-4">
          <StatusButtons productId={product.id} status={product.status} />
          <div className="flex gap-2 border-t border-goguma-200 pt-4">
            <Link
              href={`/products/${product.id}/edit`}
              className="rounded-lg border border-soil-200 bg-white px-3 py-2 text-sm font-medium text-soil-600 transition hover:bg-soil-50"
            >
              수정
            </Link>
            <DeleteButton productId={product.id} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-soil-200 p-4 text-center text-sm text-soil-600">
          채팅 기능은 3단계에서 만듭니다. 지금은 글만 주고받을 수 있어요.
        </div>
      )}
    </article>
  );
}
