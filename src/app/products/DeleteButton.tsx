"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteProduct } from "./actions";

function ConfirmButtons({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-soil-600">정말 지울까요?</span>
      <button
        type="submit"
        disabled={pending}
        className="btn btn-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? "지우는 중…" : "네, 지웁니다"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="btn btn-outline btn-sm"
      >
        아니요
      </button>
    </div>
  );
}

export default function DeleteButton({ productId }: { productId: string }) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="btn btn-outline btn-sm hover:bg-red-50 hover:text-red-700"
      >
        삭제
      </button>
    );
  }

  return (
    <form action={deleteProduct}>
      <input type="hidden" name="id" value={productId} />
      <ConfirmButtons onCancel={() => setAsking(false)} />
    </form>
  );
}
