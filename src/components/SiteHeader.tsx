import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import GogumaLogo from "./GogumaLogo";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  let unreadCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("goguma_profiles")
      .select("nickname")
      .eq("id", user.id)
      .maybeSingle();
    nickname = profile?.nickname ?? null;

    // 안 읽은 채팅 개수 (RLS 덕분에 내가 낀 방의 메시지만 세어집니다)
    const { count } = await supabase
      .from("goguma_chat_messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", user.id)
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-soil-200/70 bg-goguma-50/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2">
            <GogumaLogo />
            <span className="text-lg font-bold tracking-tight text-skin-700">
              고구마마켓
            </span>
          </Link>
          <Link
            href="/products"
            className="hidden text-sm font-medium text-soil-600 transition hover:text-goguma-600 sm:block"
          >
            중고거래
          </Link>
          {user && (
            <>
              <Link
                href="/favorites"
                className="hidden text-sm font-medium text-soil-600 transition hover:text-goguma-600 sm:block"
              >
                찜한 물건
              </Link>
              <Link
                href="/chat"
                className="flex items-center gap-1 text-sm font-medium text-soil-600 transition hover:text-goguma-600"
              >
                채팅
                {unreadCount > 0 && (
                  <span className="rounded-full bg-goguma-500 px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/products/new"
                className="rounded-lg bg-goguma-500 px-3 py-2 font-semibold text-white transition hover:bg-goguma-600"
              >
                판매하기
              </Link>
              <Link
                href="/mypage"
                className="rounded-lg px-3 py-2 font-medium text-soil-800 transition hover:bg-goguma-100"
              >
                <span className="font-semibold text-goguma-700">
                  {nickname ?? "고구마"}
                </span>
                님
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-soil-200 bg-white px-3 py-2 font-medium text-soil-600 transition hover:bg-soil-50"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 font-medium text-soil-600 transition hover:bg-goguma-100"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-goguma-500 px-3 py-2 font-semibold text-white transition hover:bg-goguma-600"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
