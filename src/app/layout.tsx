import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

// 한글이 또렷하게 나오도록 본문 글꼴을 지정합니다.
// next/font가 빌드할 때 글꼴 파일을 받아 우리 서버에서 함께 내보내므로,
// 외부 사이트를 거치지 않아 화면이 늦게 뜨거나 글자가 깜빡이지 않습니다.
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-kr",
});

export const metadata: Metadata = {
  title: "고구마마켓 — 우리 동네 중고거래",
  description: "가까운 이웃과 따뜻하게 주고받는 중고거래, 고구마마켓",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
          {children}
        </main>
        {/* 아래쪽 여백은 휴대폰 탭 막대에 가려지지 않도록 둡니다 */}
        <footer className="mt-8 border-t border-soil-200/60 py-8 pb-24 sm:pb-8">
          <p className="text-center text-xs text-soil-400">
            고구마마켓 · 공부용으로 한 단계씩 만드는 중
          </p>
        </footer>
      </body>
    </html>
  );
}
