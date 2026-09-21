"use client";

import { useFormStatus } from "react-dom";

/** 거래글의 "채팅하기" 버튼. 누르면 방을 만들거나 기존 방으로 들어갑니다. */
export default function ChatButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full py-3"
    >
      {pending ? "채팅방 여는 중…" : "채팅하기"}
    </button>
  );
}
