import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export const metadata = { title: "내 정보 — 고구마마켓" };

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware가 이미 막지만, 서버 컴포넌트에서도 한 번 더 확인합니다.
  if (!user) redirect("/login?next=/mypage");

  const { data: profile } = await supabase
    .from("goguma_profiles")
    .select("nickname, region, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const joined = new Date(profile?.created_at ?? user.created_at).toLocaleDateString(
    "ko-KR",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="mx-auto max-w-lg space-y-6">
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

        <dl className="mt-6 space-y-3 border-t border-soil-100 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-soil-600">동네</dt>
            <dd className="font-medium text-soil-800">
              {profile?.region ?? "아직 설정하지 않음"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-soil-600">가입일</dt>
            <dd className="font-medium text-soil-800">{joined}</dd>
          </div>
        </dl>
      </div>

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
