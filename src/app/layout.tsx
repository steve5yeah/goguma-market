import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "고구마마켓 — 우리 동네 중고거래",
  description: "가까운 이웃과 따뜻하게 주고받는 중고거래, 고구마마켓",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-10">{children}</main>
        <footer className="border-t border-soil-200/70 py-8 text-center text-xs text-soil-400">
          고구마마켓 · 공부용으로 한 단계씩 만드는 중
        </footer>
      </body>
    </html>
  );
}
