import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import ProductCard from "@/app/products/ProductCard";
import type { ProductWithSeller } from "@/lib/products";

export const metadata = { title: "내 정보 — 고구마마켓" };

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware가 이미 막지만, 서버 컴포넌트에서도 한 번 더 확인합니다.
  if (!user) redirect("/login?next=/mypage");

  const [{ data: profile }, { data: listings }, { count: favoriteCount }] =
    await Promise.all([
      supabase
        .from("goguma_profiles")
        .select("nickname, region, created_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("goguma_products")
        .select("*, goguma_profiles!goguma_products_seller_profile_fkey(nickname)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
      // head: true 는 "내용은 필요 없고 개수만 알려 줘"라는 뜻입니다.
      supabase
        .from("goguma_favorites")
        .select("product_id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const products = (listings ?? []) as ProductWithSeller[];
  const selling = products.filter((p) => p.status !== "sold").length;
  const sold = products.filter((p) => p.status === "sold").length;
  const totalViews = products.reduce((sum, p) => sum + (p.view_count ?? 0), 0);

  const joined = new Date(
    profile?.created_at ?? user.created_at,
  ).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const stats = [
    { label: "판매중·예약중", value: `${selling}개` },
    { label: "거래완료", value: `${sold}개` },
    { label: "내 글 총 조회", value: `${totalViews}` },
    { label: "찜한 물건", value: `${favoriteCount ?? 0}개`, href: "/favorites" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-[1.6rem] font-bold tracking-tight text-soil-900">
        내 정보
      </h1>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-goguma-200 to-goguma-400 text-3xl">
            🍠
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-soil-900">
              {profile?.nickname ?? "고구마"}
            </p>
            <p className="truncate text-sm text-soil-500">{user.email}</p>
            <p className="mt-1 text-sm text-soil-600">
              📍 {profile?.region ?? "동네를 아직 정하지 않았습니다"}
            </p>
          </div>
          <Link href="/mypage/edit" className="btn btn-outline btn-sm">
            프로필 수정
          </Link>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-soil-100 pt-5 sm:grid-cols-4">
          {stats.map((s) => {
            const body = (
              <>
                <dt className="text-xs text-soil-500">{s.label}</dt>
                <dd className="mt-1 text-lg font-bold text-soil-900">{s.value}</dd>
              </>
            );
            return s.href ? (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-xl px-2 py-1 transition hover:bg-goguma-50"
              >
                {body}
              </Link>
            ) : (
              <div key={s.label} className="px-2 py-1">
                {body}
              </div>
            );
          })}
        </dl>

        <p className="mt-4 border-t border-soil-100 pt-4 text-xs text-soil-400">
          {joined} 가입
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold tracking-tight text-soil-900">
            내 판매글
          </h2>
          <Link
            href="/products/new"
            className="text-sm font-semibold text-goguma-600 hover:underline"
          >
            + 판매하기
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-soil-200 px-4 py-14 text-center">
            <p className="text-3xl opacity-70">🍠</p>
            <p className="mt-3 text-soil-600">아직 올린 물건이 없습니다.</p>
            <Link href="/products/new" className="mt-4 inline-flex btn btn-primary">
              첫 물건 올리기
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={signOut}>
        <button type="submit" className="btn btn-outline w-full py-3">
          로그아웃
        </button>
      </form>
    </div>
  );
}
