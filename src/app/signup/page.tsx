import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata = { title: "회원가입 — 고구마마켓" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-soil-900">고구마마켓 시작하기</h1>
      <p className="mt-2 text-sm text-soil-600">
        이메일만 있으면 1분이면 됩니다.
      </p>

      <div className="mt-7 rounded-2xl border border-soil-200 bg-white p-6 shadow-sm">
        <SignupForm />
      </div>

      <p className="mt-5 text-center text-sm text-soil-600">
        이미 계정이 있나요?{" "}
        <Link
          href="/login"
          className="font-semibold text-goguma-600 hover:underline"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
