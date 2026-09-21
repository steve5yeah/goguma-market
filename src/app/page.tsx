import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GogumaLogo from "@/components/GogumaLogo";
import ProductCard from "./products/ProductCard";
import { CATEGORIES, type ProductWithSeller } from "@/lib/products";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("goguma_products")
    .select("*, goguma_profiles!goguma_products_seller_profile_fkey(nickname)")
    .neq("status", "sold")
    .order("created_at", { ascending: false })
    .limit(8);

  const products = (data ?? []) as ProductWithSeller[];

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-linear-to-br from-goguma-400 via-goguma-500 to-skin-700 px-7 py-14 text-white shadow-[var(--shadow-lift)] sm:px-12 sm:py-16">
        {/* 배경 장식 — 은은한 원 두 개 */}
        <span className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-white/[0.07]" />

        <div className="relative">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <GogumaLogo size={15} /> 우리 동네 중고거래
          </p>
          <h1 className="text-[1.9rem] font-bold leading-[1.3] tracking-tight sm:text-[2.6rem]">
            군고구마처럼 따뜻한
            <br />
            이웃 간 거래, 고구마마켓
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
            쓰지 않는 물건은 필요한 이웃에게, 필요한 물건은 가까운 곳에서.
            {user ? " 오늘도 좋은 거래 되세요!" : " 먼저 가입하고 시작해 보세요."}
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link
              href="/products"
              className="btn bg-white text-goguma-700 hover:bg-goguma-50"
            >
              물건 구경하기
            </Link>
            <Link
              href={user ? "/products/new" : "/signup"}
              className="btn border border-white/50 text-white hover:bg-white/10"
            >
              {user ? "판매하기" : "회원가입"}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
          <div className="flex w-max gap-2">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link
                key={c}
                href={`/products?category=${encodeURIComponent(c)}`}
                className="chip"
              >
                {c}
              </Link>
            ))}
            <Link href="/products" className="chip">
              전체 보기
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold tracking-tight text-soil-900">
            방금 올라온 물건
          </h2>
          <Link href="/products" className="text-sm text-soil-500 hover:underline">
            전체 보기 →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-soil-200 px-4 py-14 text-center">
            <p className="text-3xl opacity-70">🍠</p>
            <p className="mt-3 text-soil-600">아직 올라온 물건이 없습니다.</p>
            <Link href="/products/new" className="mt-4 inline-flex btn btn-primary">
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
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight text-soil-900">
          만드는 순서
        </h2>
        <ol className="grid gap-3 sm:grid-cols-4">
          {[
            { step: "1단계", title: "회원가입 · 로그인", done: true },
            { step: "2단계", title: "거래글 등록 · 수정 · 삭제", done: true },
            { step: "3단계", title: "찜하기 · 채팅", done: true },
            { step: "4단계", title: "동네 · 조회수 · 프로필", done: true },
          ].map((s) => (
            <li
              key={s.step}
              className={`rounded-2xl border p-5 ${
                s.done
                  ? "border-goguma-200 bg-goguma-50"
                  : "border-soil-200 bg-white"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  s.done ? "text-goguma-700" : "text-soil-400"
                }`}
              >
                {s.step} {s.done ? "· 완료" : "· 준비 중"}
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug text-soil-800">
                {s.title}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
