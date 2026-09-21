"use client";

import { useFormStatus } from "react-dom";
import { STATUSES, type ProductStatus } from "@/lib/products";
import { updateStatus } from "./actions";

function Inner({ value, active }: { value: ProductStatus; active: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || active}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-default ${
        active
          ? STATUSES[value].className
          : "border border-soil-200 bg-white text-soil-600 hover:bg-goguma-50 disabled:opacity-60"
      }`}
    >
      {pending ? "…" : STATUSES[value].label}
    </button>
  );
}

function StatusButton({
  productId,
  value,
  current,
}: {
  productId: string;
  value: ProductStatus;
  current: ProductStatus;
}) {
  // 서버 액션에 값을 미리 묶어 둡니다. 폼에는 따로 넣을 값이 없습니다.
  const action = updateStatus.bind(null, productId, value);

  return (
    <form action={action}>
      <Inner value={value} active={value === current} />
    </form>
  );
}

/** 글쓴이만 보는 상태 바꾸기 버튼 */
export default function StatusButtons({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-soil-600">상태</span>
      <StatusButton productId={productId} value="selling" current={status} />
      <StatusButton productId={productId} value="reserved" current={status} />
      <StatusButton productId={productId} value="sold" current={status} />
    </div>
  );
}
