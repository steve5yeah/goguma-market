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

  const [{ data: profile }, { data: listings }, { count: favoriteCount }] = await Promise.all([
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

  const joined = new Date(profile?.created_at ?? user.created_at).toLocaleDateString(
    "ko-KR",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-soil-900">내 정보</h1>

      <div className="rounded-2xl border border-soil-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-goguma-100 text-2xl">
            🍠
          </div>
          <div>
            <p className="text-lg font-bold text-soil-900">
              {profile?.nickname ?? "고구마"}
            </p>
            <p className="text-sm text-soil-600">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-soil-100 pt-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-soil-600">판매중·예약중</dt>
            <dd className="mt-0.5 font-bold text-soil-900">{selling}개</dd>
          </div>
          <div>
            <dt className="text-soil-600">거래완료</dt>
            <dd className="mt-0.5 font-bold text-soil-900">{sold}개</dd>
          </div>
          <div>
            <dt className="text-soil-600">찜한 물건</dt>
            <dd className="mt-0.5 font-bold text-soil-900">
              <Link href="/favorites" className="hover:underline">
                {favoriteCount ?? 0}개 →
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-soil-600">가입일</dt>
            <dd className="mt-0.5 font-medium text-soil-800">{joined}</dd>
          </div>
        </dl>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold text-soil-800">내 판매글</h2>
          <Link
            href="/products/new"
            className="text-sm font-semibold text-goguma-600 hover:underline"
          >
            + 판매하기
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-soil-200 px-4 py-14 text-center">
            <p className="text-3xl">🍠</p>
            <p className="mt-3 text-soil-600">아직 올린 물건이 없습니다.</p>
            <Link
              href="/products/new"
              className="mt-4 inline-block rounded-xl bg-goguma-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-goguma-600"
            >
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
        <button
          type="submit"
          className="w-full rounded-xl border border-soil-200 bg-white px-4 py-3 text-sm font-semibold text-soil-600 transition hover:bg-soil-50"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
