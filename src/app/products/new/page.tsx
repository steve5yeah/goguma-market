import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";

export const metadata = { title: "판매하기 — 고구마마켓" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/products/new");

  // 프로필에 동네를 정해 뒀으면 거래 희망 동네를 미리 채워 줍니다.
  const { data: profile } = await supabase
    .from("goguma_profiles")
    .select("region")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-soil-900">판매하기</h1>
      <p className="mb-6 text-sm text-soil-600">
        사진 한 장과 설명만 있으면 충분합니다.
      </p>
      <ProductForm defaultRegion={profile?.region ?? ""} />
    </div>
  );
}
