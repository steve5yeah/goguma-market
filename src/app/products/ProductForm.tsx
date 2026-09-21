"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CATEGORIES, type Product } from "@/lib/products";
import { createProduct, updateProduct, type ProductFormState } from "./actions";
import SubmitButton from "@/components/SubmitButton";
import ImageUploader from "./ImageUploader";

const initialState: ProductFormState = {};

/** 등록과 수정이 같은 폼을 씁니다. product가 있으면 수정 모드입니다. */
export default function ProductForm({ product }: { product?: Product }) {
  const isEdit = Boolean(product);
  const [state, formAction] = useActionState(
    isEdit ? updateProduct : createProduct,
    initialState,
  );

  // 오류로 되돌아왔을 때는 그때 입력값을, 아니면 원래 값을 보여 줍니다.
  const v = state.values;

  return (
    <form action={formAction} className="space-y-5">
      {isEdit && (
        <>
          <input type="hidden" name="id" value={product!.id} />
          <input
            type="hidden"
            name="previousImagePath"
            value={product!.image_path ?? ""}
          />
        </>
      )}

      <ImageUploader
        initialUrl={v?.imageUrl ?? product?.image_url}
        initialPath={v?.imagePath ?? product?.image_path}
      />

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-soil-800">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={40}
          defaultValue={v?.title ?? product?.title ?? ""}
          placeholder="예) 거의 새것 에어프라이어 팝니다"
          className="field"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-soil-800">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={v?.category ?? product?.category ?? ""}
            className="field"
          >
            <option value="" disabled>
              골라 주세요
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-soil-800">
            가격 <span className="font-normal text-soil-400">(0원이면 나눔)</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            required
            defaultValue={v?.price ?? product?.price ?? ""}
            placeholder="0"
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="region" className="mb-1.5 block text-sm font-medium text-soil-800">
          거래 희망 동네 <span className="font-normal text-soil-400">(선택)</span>
        </label>
        <input
          id="region"
          name="region"
          type="text"
          maxLength={30}
          defaultValue={v?.region ?? product?.region ?? ""}
          placeholder="예) 역삼동, 강남역 5번 출구"
          className="field"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-soil-800"
        >
          설명
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={5}
          maxLength={2000}
          rows={8}
          defaultValue={v?.description ?? product?.description ?? ""}
          placeholder={
            "구입 시기, 사용 기간, 상태, 하자 여부를 적어 주시면 거래가 빨라집니다."
          }
          className="field resize-y"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href={isEdit ? `/products/${product!.id}` : "/products"}
          className="rounded-xl border border-soil-200 bg-white px-5 py-3 text-sm font-semibold text-soil-600 transition hover:bg-soil-50"
        >
          취소
        </Link>
        <div className="flex-1">
          <SubmitButton pendingText={isEdit ? "저장 중…" : "등록 중…"}>
            {isEdit ? "수정 완료" : "등록하기"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
