import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "로그인 — 고구마마켓" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-soil-900">다시 오셨네요</h1>
      <p className="mt-2 text-sm text-soil-600">
        고구마마켓 계정으로 로그인하세요.
      </p>

      <div className="mt-7 rounded-2xl border border-soil-200 bg-white p-6 shadow-sm">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-5 text-center text-sm text-soil-600">
        아직 계정이 없나요?{" "}
        <Link
          href="/signup"
          className="font-semibold text-goguma-600 hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}
