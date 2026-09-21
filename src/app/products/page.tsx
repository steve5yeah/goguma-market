import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type ProductWithSeller } from "@/lib/products";
import ProductCard from "./ProductCard";

export const metadata = { title: "중고거래 — 고구마마켓" };

type SearchParams = Promise<{ q?: string; category?: string; sold?: string }>;

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", category = "", sold = "" } = await searchParams;
  const showSold = sold === "1";

  const supabase = await createClient();

  let query = supabase
    .from("goguma_products")
    .select("*, goguma_profiles(nickname)")
    .order("created_at", { ascending: false })
    .limit(60);

  if (q.trim()) {
    // 제목이나 설명에 검색어가 들어간 글
    const safe = q.trim().replace(/[%,()]/g, " ");
    query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    query = query.eq("category", category);
  }
  if (!showSold) {
    query = query.neq("status", "sold");
  }

  const { data, error } = await query;
  const products = (data ?? []) as ProductWithSeller[];

  const linkFor = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { q, category, sold: showSold ? "1" : "", ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-soil-900">중고거래</h1>
        <Link
          href="/products/new"
          className="rounded-xl bg-goguma-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-goguma-600"
        >
          + 판매하기
        </Link>
      </div>

      <form action="/products" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="어떤 물건을 찾으세요?"
          className="field flex-1"
        />
        {category && <input type="hidden" name="category" value={category} />}
        {showSold && <input type="hidden" name="sold" value="1" />}
        <button
          type="submit"
          className="rounded-xl border border-soil-200 bg-white px-4 text-sm font-semibold text-soil-600 transition hover:bg-soil-50"
        >
          검색
        </button>
      </form>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2 pb-1">
          <Link
            href={linkFor({ category: "" })}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
              category === ""
                ? "bg-goguma-500 font-semibold text-white"
                : "border border-soil-200 bg-white text-soil-600 hover:bg-goguma-50"
            }`}
          >
            전체
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={linkFor({ category: c })}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                category === c
                  ? "bg-goguma-500 font-semibold text-white"
                  : "border border-soil-200 bg-white text-soil-600 hover:bg-goguma-50"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-soil-600">
        <span>{products.length}개</span>
        <Link href={linkFor({ sold: showSold ? "" : "1" })} className="hover:underline">
          {showSold ? "거래완료 숨기기" : "거래완료도 보기"}
        </Link>
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          목록을 불러오지 못했습니다: {error.message}
        </p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-soil-200 px-4 py-16 text-center">
          <p className="text-3xl">🍠</p>
          <p className="mt-3 text-soil-600">
            {q || category ? "조건에 맞는 물건이 없습니다." : "아직 올라온 물건이 없습니다."}
          </p>
          <Link
            href="/products/new"
            className="mt-4 inline-block rounded-xl bg-goguma-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-goguma-600"
          >
            첫 물건 올리기
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
