import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type ProductWithSeller } from "@/lib/products";
import ProductCard from "./ProductCard";

export const metadata = { title: "중고거래 — 고구마마켓" };

type SearchParams = Promise<{
  q?: string;
  category?: string;
  sold?: string;
  near?: string;
}>;

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", category = "", sold = "", near = "" } = await searchParams;
  const showSold = sold === "1";
  const nearOnly = near === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 내 동네 필터를 보여 주려면 내 프로필의 동네를 알아야 합니다.
  let myRegion: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("goguma_profiles")
      .select("region")
      .eq("id", user.id)
      .maybeSingle();
    myRegion = profile?.region ?? null;
  }

  let query = supabase
    .from("goguma_products")
    .select("*, goguma_profiles!goguma_products_seller_profile_fkey(nickname)")
    .order("created_at", { ascending: false })
    .limit(60);

  if (q.trim()) {
    const safe = q.trim().replace(/[%,()]/g, " ");
    query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    query = query.eq("category", category);
  }
  if (!showSold) {
    query = query.neq("status", "sold");
  }
  if (nearOnly && myRegion) {
    query = query.ilike("region", `%${myRegion}%`);
  }

  const { data, error } = await query;
  const products = (data ?? []) as ProductWithSeller[];

  const linkFor = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = {
      q,
      category,
      sold: showSold ? "1" : "",
      near: nearOnly ? "1" : "",
      ...next,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.6rem] font-bold tracking-tight text-soil-900">
            중고거래
          </h1>
          <p className="mt-1 text-sm text-soil-500">
            {myRegion
              ? `${myRegion} 이웃들이 내놓은 물건`
              : "우리 동네 이웃들이 내놓은 물건"}
          </p>
        </div>
        <Link href="/products/new" className="btn btn-primary">
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
        {nearOnly && <input type="hidden" name="near" value="1" />}
        <button type="submit" className="btn btn-outline">
          검색
        </button>
      </form>

      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
        <div className="flex w-max gap-2 pb-1">
          <Link
            href={linkFor({ category: "" })}
            className={`chip ${category === "" ? "chip-on" : ""}`}
          >
            전체
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={linkFor({ category: c })}
              className={`chip ${category === c ? "chip-on" : ""}`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-y border-soil-100 py-2.5">
        <span className="text-sm font-medium text-soil-600">
          {products.length}개
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {myRegion ? (
            <Link
              href={linkFor({ near: nearOnly ? "" : "1" })}
              className={`chip btn-sm ${nearOnly ? "chip-on" : ""}`}
            >
              📍 {myRegion}만
            </Link>
          ) : (
            <Link href="/mypage/edit" className="chip btn-sm">
              📍 내 동네 정하기
            </Link>
          )}
          <Link
            href={linkFor({ sold: showSold ? "" : "1" })}
            className={`chip btn-sm ${showSold ? "chip-on" : ""}`}
          >
            거래완료 포함
          </Link>
        </div>
      </div>

      {error ? (
        <p className="card px-4 py-6 text-center text-sm text-red-700">
          목록을 불러오지 못했습니다: {error.message}
        </p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-soil-200 px-4 py-16 text-center">
          <p className="text-3xl opacity-70">🍠</p>
          <p className="mt-3 text-soil-600">
            {q || category || nearOnly
              ? "조건에 맞는 물건이 없습니다."
              : "아직 올라온 물건이 없습니다."}
          </p>
          {(q || category || nearOnly) && (
            <Link href="/products" className="mt-4 inline-flex btn btn-outline">
              조건 모두 지우기
            </Link>
          )}
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
