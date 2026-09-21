import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithSeller } from "@/lib/products";
import ProductCard from "@/app/products/ProductCard";

export const metadata = { title: "찜한 물건 — 고구마마켓" };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/favorites");

  // 내 찜 기록에서 거래글을 통째로 끌고 옵니다.
  const { data } = await supabase
    .from("goguma_favorites")
    .select("created_at, goguma_products(*, goguma_profiles!goguma_products_seller_profile_fkey(nickname))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products = (data ?? [])
    .map((row) => row.goguma_products as unknown as ProductWithSeller | null)
    .filter((p): p is ProductWithSeller => Boolean(p));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-soil-900">찜한 물건</h1>
        <Link href="/products" className="text-sm text-soil-600 hover:underline">
          중고거래 둘러보기 →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-soil-200 px-4 py-16 text-center">
          <p className="text-3xl">🤍</p>
          <p className="mt-3 text-soil-600">아직 찜한 물건이 없습니다.</p>
          <p className="mt-1 text-sm text-soil-400">
            마음에 드는 물건의 하트를 눌러 두면 여기 모입니다.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-xl bg-goguma-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-goguma-600"
          >
            물건 구경하기
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-soil-600">{products.length}개</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
