"use client";

import Link from "next/link";
import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { updateProfile, type ProfileState } from "../actions";

const initialState: ProfileState = {};

export default function ProfileForm({
  nickname,
  region,
}: {
  nickname: string;
  region: string;
}) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium text-soil-800">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={12}
          defaultValue={state.values?.nickname ?? nickname}
          placeholder="이웃에게 보일 이름 (2~12자)"
          className="field"
        />
        <p className="mt-1.5 text-xs text-soil-400">
          거래글과 채팅에 이 이름이 보입니다. 다른 사람과 겹칠 수 없습니다.
        </p>
      </div>

      <div>
        <label htmlFor="region" className="mb-1.5 block text-sm font-medium text-soil-800">
          우리 동네
        </label>
        <input
          id="region"
          name="region"
          type="text"
          maxLength={30}
          defaultValue={state.values?.region ?? region}
          placeholder="예) 역삼동"
          className="field"
        />
        <p className="mt-1.5 text-xs text-soil-400">
          정해 두면 글 쓸 때 자동으로 채워지고, 목록에서 내 동네 물건만 골라 볼 수 있습니다.
        </p>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href="/mypage"
          className="btn btn-outline"
        >
          취소
        </Link>
        <div className="flex-1">
          <SubmitButton pendingText="저장 중…">저장</SubmitButton>
        </div>
      </div>
    </form>
  );
}
