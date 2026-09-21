"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/products";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Props = {
  initialUrl?: string | null;
  initialPath?: string | null;
};

/**
 * 사진은 서버 액션을 거치지 않고 브라우저에서 Storage로 곧장 올립니다.
 * (서버 액션 본문은 기본 1MB 제한이 있어서 사진을 통째로 보내기엔 좁습니다.)
 * 업로드가 끝나면 주소를 hidden input에 담아 두고, 폼을 보낼 때 함께 전송됩니다.
 */
export default function ImageUploader({ initialUrl, initialPath }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [path, setPath] = useState(initialPath ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError("JPG · PNG · WEBP · GIF 파일만 올릴 수 있습니다.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("사진은 5MB까지 올릴 수 있습니다.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 풀렸습니다. 다시 로그인해 주세요.");
      setBusy(false);
      return;
    }

    // 정책상 경로 첫 칸은 반드시 본인 id 여야 합니다.
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const nextPath = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(nextPath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(`사진 올리기에 실패했습니다: ${uploadError.message}`);
      setBusy(false);
      return;
    }

    // 직전에 올려 둔 사진이 있으면 쓰레기로 남지 않게 지웁니다.
    if (path && path !== initialPath) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(nextPath);

    setUrl(publicUrl);
    setPath(nextPath);
    setBusy(false);
  }

  async function handleRemove() {
    // 이번에 새로 올린 파일만 지웁니다. 원래 있던 사진은 저장할 때 정리합니다.
    if (path && path !== initialPath) {
      const supabase = createClient();
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
    }
    setUrl("");
    setPath("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-soil-800">
        사진 <span className="font-normal text-soil-400">(선택, 1장)</span>
      </span>

      <input type="hidden" name="imageUrl" value={url} />
      <input type="hidden" name="imagePath" value={path} />

      {url ? (
        <div className="relative w-40 overflow-hidden rounded-xl border border-soil-200">
          <Image
            src={url}
            alt="올린 사진 미리보기"
            width={160}
            height={160}
            className="h-40 w-40 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white transition hover:bg-black/75"
          >
            지우기
          </button>
        </div>
      ) : (
        <label
          className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-soil-200 bg-white text-center transition hover:border-goguma-300 hover:bg-goguma-50 ${
            busy ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <span className="text-2xl">{busy ? "⏳" : "📷"}</span>
          <span className="text-xs text-soil-600">
            {busy ? "올리는 중…" : "사진 고르기"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
