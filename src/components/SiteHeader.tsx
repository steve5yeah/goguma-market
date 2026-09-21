import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import GogumaLogo from "./GogumaLogo";
import MobileNav from "./MobileNav";

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
    <>
      <header className="sticky top-0 z-20 border-b border-soil-200/60 bg-[#fffdfa]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <GogumaLogo size={26} />
              <span className="text-[1.05rem] font-bold tracking-tight text-skin-700">
                고구마마켓
              </span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              <Link href="/products" className="btn btn-ghost btn-sm">
                중고거래
              </Link>
              {user && (
                <>
                  <Link href="/favorites" className="btn btn-ghost btn-sm">
                    찜한 물건
                  </Link>
                  <Link href="/chat" className="btn btn-ghost btn-sm">
                    채팅
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-goguma-500 px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/products/new"
                  className="btn btn-primary btn-sm hidden sm:inline-flex"
                >
                  판매하기
                </Link>
                <Link
                  href="/mypage"
                  className="btn btn-ghost btn-sm max-w-[9rem] truncate"
                >
                  <span className="truncate font-semibold text-goguma-700">
                    {nickname ?? "고구마"}
                  </span>
                  <span className="text-soil-500">님</span>
                </Link>
                <form action={signOut} className="hidden sm:block">
                  <button type="submit" className="btn btn-outline btn-sm">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  로그인
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 좁은 화면에서는 아래쪽 탭으로 이동합니다 */}
      <MobileNav loggedIn={Boolean(user)} unreadCount={unreadCount} />
    </>
  );
}
