"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/products", label: "중고거래", icon: "🏠", always: true },
  { href: "/favorites", label: "찜", icon: "❤️", always: false },
  { href: "/products/new", label: "판매하기", icon: "➕", always: false },
  { href: "/chat", label: "채팅", icon: "💬", always: false },
  { href: "/mypage", label: "내 정보", icon: "🍠", always: false },
];

/** 좁은 화면(휴대폰)에서 화면 아래에 붙는 이동 막대 */
export default function MobileNav({
  loggedIn,
  unreadCount,
}: {
  loggedIn: boolean;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => i.always || loggedIn);

  if (!loggedIn) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-soil-200/70 bg-[#fffdfa]/95 backdrop-blur-md sm:hidden">
      <ul className="mx-auto flex max-w-5xl">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[0.7rem] ${
                  active ? "font-bold text-goguma-700" : "text-soil-500"
                }`}
              >
                <span className="relative text-base leading-none">
                  {item.icon}
                  {item.href === "/chat" && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-1 rounded-full bg-goguma-500 px-1 text-[0.6rem] font-bold leading-tight text-white">
                      {unreadCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
