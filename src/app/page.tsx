import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GogumaLogo from "@/components/GogumaLogo";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-linear-to-br from-goguma-400 via-goguma-500 to-skin-700 px-7 py-14 text-white shadow-sm sm:px-12">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
          <GogumaLogo size={16} /> 우리 동네 중고거래
        </p>
        <h1 className="text-3xl font-bold leading-snug sm:text-4xl">
          군고구마처럼 따뜻한
          <br />
          이웃 간 거래, 고구마마켓
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
          쓰지 않는 물건은 필요한 이웃에게, 필요한 물건은 가까운 곳에서.
          {user ? " 오늘도 좋은 거래 되세요!" : " 먼저 가입하고 시작해 보세요."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <Link
              href="/mypage"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-goguma-700 transition hover:bg-goguma-50"
            >
              내 정보 보기
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-goguma-700 transition hover:bg-goguma-50"
              >
                회원가입하기
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-soil-800">만드는 순서</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            { step: "1단계", title: "회원가입 · 로그인", done: true },
            { step: "2단계", title: "상품 등록과 목록", done: false },
            { step: "3단계", title: "채팅과 찜하기", done: false },
          ].map((s) => (
            <li
              key={s.step}
              className={`rounded-2xl border p-5 ${
                s.done
                  ? "border-goguma-300 bg-goguma-100/60"
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
              <p className="mt-1 font-semibold text-soil-800">{s.title}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
