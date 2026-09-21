"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "./actions";

type Props = {
  productId: string;
  isFavorited: boolean;
  count: number;
};

/**
 * 하트 버튼.
 *
 * useOptimistic은 "서버 응답을 기다리는 동안 미리 바뀐 것처럼 보여 주는" 기능입니다.
 * 누르면 하트가 즉시 채워지고, 서버 저장이 끝나면 진짜 값으로 맞춰집니다.
 * (저장에 실패하면 원래대로 되돌아갑니다.)
 */
export default function FavoriteButton({ productId, isFavorited, count }: Props) {
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { on: isFavorited, count },
    (_state, next: boolean) => ({
      on: next,
      count: Math.max(count + (next ? 1 : 0) - (isFavorited ? 1 : 0), 0),
    }),
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic(!optimistic.on);
      await toggleFavorite(productId, optimistic.on);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={optimistic.on}
      aria-label={optimistic.on ? "찜 취소" : "찜하기"}
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        optimistic.on
          ? "border-goguma-300 bg-goguma-100 text-goguma-700"
          : "border-soil-200 bg-white text-soil-600 hover:bg-goguma-50"
      }`}
    >
      <span className="text-base leading-none">{optimistic.on ? "❤️" : "🤍"}</span>
      찜 {optimistic.count}
    </button>
  );
}
